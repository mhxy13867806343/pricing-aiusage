import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ConfigProvider,
  theme as antdTheme,
  Input,
  Select,
  Button,
  Spin,
  Empty,
  FloatButton,
} from 'antd';
import {
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import './App.css';
import { ModelItem, ProviderInfo, SortConfig, ApiResponse, SortColumn } from './types';
import { resolveProvider, getModelShortName, INVERT_DARK_ICONS } from './constants/providers';
import { PROVIDER_ICONS } from './constants/icons';
import { formatPrice } from './utils/format';

const SORT_OPTIONS = [
  { value: 'inputOutput:descending', label: '输入价格：从高到低' },
  { value: 'inputOutput:ascending', label: '输入价格：从低到高' },
  { value: 'model:ascending', label: '模型名称：A → Z' },
  { value: 'model:descending', label: '模型名称：Z → A' },
  { value: 'cache:descending', label: '缓存价格：从高到低' },
  { value: 'cache:ascending', label: '缓存价格：从低到高' },
];

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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Sync theme attribute with body & localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch real online data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const isLocalDev =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. In local dev: use Vite dev proxy to fetch live Juejin API without CORS
    // 2. On GitHub Pages: use same-origin ./pricing.json (synced from real Juejin API by GitHub Actions) to eliminate CORS restrictions
    const baseUrl = import.meta.env.BASE_URL || './';
    const targetUrl = isLocalDev
      ? '/aiusage_api/functions/tud-pricing'
      : `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}pricing.json`;

    try {
      let res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      // If failed, fallback to relative pricing.json
      if (!res.ok && targetUrl !== './pricing.json') {
        res = await fetch('./pricing.json');
      }

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
      const msg = err instanceof Error ? err.message : '数据请求异常';
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
      if (selectedProvider && selectedProvider !== '') {
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

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1e80ff',
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
      }}
    >
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
            <Button
              type="text"
              shape="circle"
              icon={theme === 'dark' ? <SunOutlined style={{ fontSize: 16 }} /> : <MoonOutlined style={{ fontSize: 16 }} />}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title="切换深色/浅色模式"
            />
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

        {/* Ant Design Filter Toolbar */}
        <div className="toolbar" aria-label="价格筛选条件">
          {/* 1. Ant Design Search Input */}
          <div className="search-box">
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="模糊查询模型"
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: 36 }}
            />
          </div>

          {/* 2. Ant Design Provider Select */}
          <Select
            value={selectedProvider || ''}
            onChange={(val) => setSelectedProvider(val)}
            style={{ width: 170, height: 36 }}
            options={[
              {
                value: '',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🌐</span> 全部供应商
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{allModels.length}</span>
                  </div>
                ),
              },
              ...availableProviders.map((p) => ({
                value: p.key,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {renderProviderIcon(p, 14)}
                      <span>{p.label}</span>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.count}</span>
                  </div>
                ),
              })),
            ]}
          />

          {/* 3. Ant Design Sort Select */}
          <Select
            value={currentSortKey}
            onChange={(val) => {
              const [col, dir] = val.split(':');
              setSortConfig({
                column: col as SortColumn,
                direction: dir as 'ascending' | 'descending',
              });
            }}
            style={{ width: 180, height: 36 }}
            options={SORT_OPTIONS}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spin size="large" tip="正在加载最新模型价格数据..." />
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className="state-container">
            <Empty
              description={<span style={{ color: 'var(--text-secondary)' }}>{errorMsg}</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData}>
                重试加载
              </Button>
            </Empty>
          </div>
        )}

        {/* Results */}
        {!loading && !errorMsg && (
          <>
            {filteredModels.length === 0 ? (
              <div className="state-container">
                <Empty description="没有匹配的模型，请尝试其他关键词或更换供应商" />
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
                                <CaretUpOutlined
                                  className={
                                    sortConfig.column === 'model' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
                                <CaretDownOutlined
                                  className={
                                    sortConfig.column === 'model' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
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
                                <CaretUpOutlined
                                  className={
                                    sortConfig.column === 'inputOutput' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
                                <CaretDownOutlined
                                  className={
                                    sortConfig.column === 'inputOutput' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
                              </span>
                            </span>
                          </th>
                          <th className="sortable" style={{ width: '24%' }} onClick={() => handleHeaderSort('cache')}>
                            <span className="th-content">
                              <span>缓存</span>
                              <span className="sort-arrows">
                                <CaretUpOutlined
                                  className={
                                    sortConfig.column === 'cache' && sortConfig.direction === 'ascending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
                                <CaretDownOutlined
                                  className={
                                    sortConfig.column === 'cache' && sortConfig.direction === 'descending'
                                      ? 'arrow-active'
                                      : ''
                                  }
                                />
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

      {/* Ant Design FloatButton for Back to Top */}
      <FloatButton.BackTop
        visibilityHeight={80}
        style={{ right: 24, bottom: 75, zIndex: 99999 }}
        tooltip="返回顶部"
      />
    </ConfigProvider>
  );
};
