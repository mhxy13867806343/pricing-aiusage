import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './App.css';
import { ModelItem, ProviderInfo, SortConfig, ApiResponse, SortColumn } from './types';
import { resolveProvider, getModelShortName, INVERT_DARK_ICONS } from './constants/providers';
import { PROVIDER_ICONS } from './constants/icons';
import { formatPrice } from './utils/format';

const SORT_LABELS: Record<string, string> = {
  'inputOutput:descending': '输入价格：从高到低',
  'inputOutput:ascending': '输入价格：从低到高',
  'model:ascending': '模型名称：A → Z',
  'model:descending': '模型名称：Z → A',
  'cache:descending': '缓存价格：从高到低',
  'cache:ascending': '缓存价格：从低到高',
};

export const App: React.FC = () => {
  const [allModels, setAllModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'inputOutput',
    direction: 'descending',
  });

  const [providerDropdownOpen, setProviderDropdownOpen] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const providerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync theme attribute
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setProviderDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowBackToTop(top > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch real online data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    // In local dev with Vite dev server, use proxy to eliminate CORS
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const targetUrl = isLocalDev
      ? '/aiusage_api/functions/tud-pricing'
      : 'https://api.juejin.cn/aiusage_api/functions/tud-pricing';

    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: 请求失败`);
      }

      const data: ApiResponse = await res.json();
      if (!data || !data.exact || typeof data.exact !== 'object') {
        throw new Error('接口返回数据格式异常');
      }

      const parsed: ModelItem[] = Object.entries(data.exact).map(([modelId, pricing]) => ({
        id: modelId,
        model: modelId,
        shortName: getModelShortName(modelId),
        provider: resolveProvider(modelId),
        input: pricing.input || 0,
        output: pricing.output || 0,
        cacheRead: pricing.cache_read || 0,
        cacheWrite: pricing.cache_write || 0,
      }));

      setAllModels(parsed);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      const msg = err instanceof Error ? err.message : '网络或跨域受限 (CORS)';
      setErrorMsg(`数据获取失败: ${msg}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Available providers with counts
  const availableProviders = useMemo(() => {
    const map = new Map<string, ProviderInfo & { count: number }>();
    allModels.forEach((m) => {
      const p = m.provider;
      if (!map.has(p.key)) {
        map.set(p.key, { ...p, count: 0 });
      }
      map.get(p.key)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [allModels]);

  // Filter & Sort
  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = allModels.filter((item) => {
      if (q && !item.model.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedProvider && selectedProvider !== 'all') {
        if (item.provider.key !== selectedProvider) {
          return false;
        }
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortConfig.column === 'model') {
        cmp = a.shortName.localeCompare(b.shortName);
        if (cmp === 0) {
          cmp = a.model.localeCompare(b.model);
        }
      } else if (sortConfig.column === 'inputOutput') {
        cmp = a.input - b.input;
        if (cmp === 0) {
          cmp = a.output - b.output;
        }
      } else if (sortConfig.column === 'cache') {
        cmp = a.cacheRead - b.cacheRead;
        if (cmp === 0) {
          cmp = a.cacheWrite - b.cacheWrite;
        }
      }

      if (cmp !== 0) {
        return sortConfig.direction === 'descending' ? -cmp : cmp;
      }
      return a.model.localeCompare(b.model);
    });

    return result;
  }, [allModels, searchQuery, selectedProvider, sortConfig]);

  const handleHeaderSort = (column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'ascending' ? 'descending' : 'ascending',
        };
      }
      return {
        column,
        direction: column === 'model' ? 'ascending' : 'descending',
      };
    });
  };

  const renderProviderIcon = (provider: ProviderInfo, size = 20) => {
    const svgUri = PROVIDER_ICONS[provider.icon];
    const shouldInvert = INVERT_DARK_ICONS.has(provider.icon);
    if (svgUri && svgUri.startsWith('data:image/svg+xml')) {
      return (
        <img
          src={svgUri}
          width={size}
          height={size}
          alt={provider.label}
          className={shouldInvert ? 'invert-dark' : ''}
        />
      );
    }
    const initial = (provider.label || 'M').charAt(0).toUpperCase();
    return <span className="provider-fallback-char">{initial}</span>;
  };

  const currentSortKey = `${sortConfig.column}:${sortConfig.direction}`;
  const selectedProviderObj = availableProviders.find((p) => p.key === selectedProvider);

  return (
    <>
      {/* Top Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <div className="brand-logo">
              <div className="brand-icon">
                {/* Juejin Origami Logo */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 9.5L4.5 11.5L12 6L19.5 11.5L22 9.5L12 2Z" fill="#1E80FF" />
                  <path d="M12 9.2L6 13.8L7.5 15L12 11.6L16.5 15L18 13.8L12 9.2Z" fill="#1E80FF" />
                  <path d="M12 15L9 17.3L9.8 18L12 16.3L14.2 18L15 17.3L12 15Z" fill="#1E80FF" />
                </svg>
              </div>
              <span className="brand-title">AI Usage Dashboard</span>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title="切换深色/浅色模式"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Title Row */}
        <div className="page-header-row">
          <div className="page-title">
            <span>模型价格</span>
            <span className="meta-count">
              {loading
                ? '加载中...'
                : filteredModels.length === allModels.length
                ? `共 ${allModels.length} 个模型`
                : `已筛选 ${filteredModels.length} / ${allModels.length} 个模型`}
            </span>
          </div>
          <div className="meta-units">单位：USD / 1M Tokens</div>
        </div>

        {/* Toolbar */}
        <div className="toolbar" aria-label="价格筛选条件">
          {/* Search Box */}
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="模糊查询模型"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                style={{ display: 'block' }}
                onClick={() => setSearchQuery('')}
                title="清空搜索"
              >
                ✕
              </button>
            )}
          </div>

          {/* Provider Dropdown */}
          <div className={`dropdown ${providerDropdownOpen ? 'open' : ''}`} ref={providerRef}>
            <div
              className="dropdown-trigger"
              onClick={() => {
                setSortDropdownOpen(false);
                setProviderDropdownOpen((v) => !v);
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {selectedProviderObj ? (
                  <>
                    {renderProviderIcon(selectedProviderObj, 14)}
                    <span>{selectedProviderObj.label}</span>
                  </>
                ) : (
                  '全部供应商'
                )}
              </span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {providerDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${!selectedProvider ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProvider('');
                    setProviderDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-item-check">{!selectedProvider ? '✓' : '\u00A0'}</span>
                  <span className="dropdown-item-icon">🌐</span>
                  <span>全部供应商</span>
                  <span className="dropdown-item-count">{allModels.length}</span>
                </div>
                {availableProviders.map((p) => {
                  const isActive = selectedProvider === p.key;
                  return (
                    <div
                      key={p.key}
                      className={`dropdown-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedProvider(p.key);
                        setProviderDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-item-check">{isActive ? '✓' : '\u00A0'}</span>
                      <span className="dropdown-item-icon">{renderProviderIcon(p, 16)}</span>
                      <span>{p.label}</span>
                      <span className="dropdown-item-count">{p.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className={`dropdown ${sortDropdownOpen ? 'open' : ''}`} ref={sortRef}>
            <div
              className="dropdown-trigger"
              onClick={() => {
                setProviderDropdownOpen(false);
                setSortDropdownOpen((v) => !v);
              }}
            >
              <span>{SORT_LABELS[currentSortKey] || '排序'}</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {sortDropdownOpen && (
              <div className="dropdown-menu">
                {Object.entries(SORT_LABELS).map(([val, label]) => {
                  const isActive = val === currentSortKey;
                  return (
                    <div
                      key={val}
                      className={`dropdown-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        const [col, dir] = val.split(':');
                        setSortConfig({
                          column: col as SortColumn,
                          direction: dir as 'ascending' | 'descending',
                        });
                        setSortDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-item-check">{isActive ? '✓' : '\u00A0'}</span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="table-container">
            <div className="skeleton-row" style={{ height: 48, background: 'var(--bg-surface-secondary)' }}>
              <div className="skeleton-shimmer" style={{ width: 120, height: 16 }} />
              <div className="skeleton-shimmer" style={{ width: 160, height: 16, marginLeft: 'auto' }} />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-row">
                <div className="skeleton-shimmer" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton-shimmer" style={{ width: '40%', height: 16 }} />
                  <div className="skeleton-shimmer" style={{ width: '60%', height: 12 }} />
                </div>
                <div className="skeleton-shimmer" style={{ width: 100, height: 32 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className="state-container">
            <svg className="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="state-title">{errorMsg}</div>
            <div className="state-subtitle">如遇到跨域拦截，请在本地通过 Vite 运行或配置代理后访问</div>
            <button type="button" className="btn-primary" onClick={fetchData}>
              重试
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !errorMsg && (
          <>
            {filteredModels.length === 0 ? (
              <div className="state-container">
                <svg className="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div className="state-title">没有匹配的模型</div>
                <div className="state-subtitle">请尝试其他关键词或更换供应商筛选条件</div>
              </div>
            ) : (
              <>
                {/* 1. PC Table View */}
                <section className="pc-view">
                  <div className="table-container">
                    <table className="pricing-table">
                      <thead>
                        <tr>
                          <th className="sortable" style={{ width: '50%' }} onClick={() => handleHeaderSort('model')}>
                            <span className="th-content">
                              <span>模型</span>
                              <span className="sort-arrows">
                                <svg
                                  className={`arrow-up ${
                                    sortConfig.column === 'model' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 4L4 16H20L12 4Z" />
                                </svg>
                                <svg
                                  className={`arrow-down ${
                                    sortConfig.column === 'model' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 20L20 8H4L12 20Z" />
                                </svg>
                              </span>
                            </span>
                          </th>
                          <th
                            className="sortable"
                            style={{ width: '26%' }}
                            onClick={() => handleHeaderSort('inputOutput')}
                          >
                            <span className="th-content">
                              <span>输入 / 输出</span>
                              <span className="sort-arrows">
                                <svg
                                  className={`arrow-up ${
                                    sortConfig.column === 'inputOutput' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 4L4 16H20L12 4Z" />
                                </svg>
                                <svg
                                  className={`arrow-down ${
                                    sortConfig.column === 'inputOutput' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 20L20 8H4L12 20Z" />
                                </svg>
                              </span>
                            </span>
                          </th>
                          <th className="sortable" style={{ width: '24%' }} onClick={() => handleHeaderSort('cache')}>
                            <span className="th-content">
                              <span>缓存</span>
                              <span className="sort-arrows">
                                <svg
                                  className={`arrow-up ${
                                    sortConfig.column === 'cache' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 4L4 16H20L12 4Z" />
                                </svg>
                                <svg
                                  className={`arrow-down ${
                                    sortConfig.column === 'cache' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 20L20 8H4L12 20Z" />
                                </svg>
                              </span>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredModels.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="model-cell">
                                <div className="provider-badge" title={item.provider.label}>
                                  {renderProviderIcon(item.provider, 22)}
                                </div>
                                <div className="model-info">
                                  <div className="model-name" title={item.model}>
                                    {item.shortName}
                                  </div>
                                  {item.model.includes('/') && (
                                    <div className="model-id-full" title={item.model}>
                                      {item.model}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="price-stack">
                                <div className="price-item">
                                  <span className="tag">输入</span>
                                  <span className="amount">{formatPrice(item.input)}</span>
                                  <span className="unit">/M</span>
                                </div>
                                <div className="price-item">
                                  <span className="tag">输出</span>
                                  <span className="amount">{formatPrice(item.output)}</span>
                                  <span className="unit">/M</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="price-stack">
                                <div className="price-item">
                                  <span className="tag">缓存读</span>
                                  {item.cacheRead > 0 ? (
                                    <span className="amount">{formatPrice(item.cacheRead)}</span>
                                  ) : (
                                    <span className="amount empty-dash">-</span>
                                  )}
                                  <span className="unit">/M</span>
                                </div>
                                <div className="price-item">
                                  <span className="tag">缓存写</span>
                                  {item.cacheWrite > 0 ? (
                                    <span className="amount">{formatPrice(item.cacheWrite)}</span>
                                  ) : (
                                    <span className="amount empty-dash">-</span>
                                  )}
                                  <span className="unit">/M</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 2. Mobile Card View */}
                <section className="mobile-view">
                  <div className="mobile-cards-grid">
                    {filteredModels.map((item) => (
                      <div className="pricing-card" key={item.id}>
                        <div className="card-header">
                          <div className="provider-badge" title={item.provider.label}>
                            {renderProviderIcon(item.provider, 18)}
                          </div>
                          <div className="model-info">
                            <div className="model-name">{item.shortName}</div>
                            {item.model.includes('/') && (
                              <div className="model-id-full" title={item.model}>
                                {item.model}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-body-grid">
                          <div className="price-item">
                            <span className="tag">输入</span>
                            <span className="amount">{formatPrice(item.input)}</span>
                            <span className="unit">/M</span>
                          </div>
                          <div className="price-item">
                            <span className="tag">输出</span>
                            <span className="amount">{formatPrice(item.output)}</span>
                            <span className="unit">/M</span>
                          </div>
                          <div className="price-item">
                            <span className="tag">缓存读</span>
                            {item.cacheRead > 0 ? (
                              <span className="amount">{formatPrice(item.cacheRead)}</span>
                            ) : (
                              <span className="amount empty-dash">-</span>
                            )}
                            <span className="unit">/M</span>
                          </div>
                          <div className="price-item">
                            <span className="tag">缓存写</span>
                            {item.cacheWrite > 0 ? (
                              <span className="amount">{formatPrice(item.cacheWrite)}</span>
                            ) : (
                              <span className="amount empty-dash">-</span>
                            )}
                            <span className="unit">/M</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Back to Top Floating Button */}
      <button
        type="button"
        className={`back-to-top-btn ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="返回顶部"
        aria-label="返回顶部"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
        <span className="btn-label">顶部</span>
      </button>
    </>
  );
};
