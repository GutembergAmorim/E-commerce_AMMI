import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, ShoppingCart, TrendingUp, Users,
  BarChart3, Package
} from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmtMoney = (v) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando relatórios...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid py-5 text-center">
        <p style={{ color: '#999' }}>Erro ao carregar dados.</p>
      </div>
    );
  }

  const { overview, dailyRevenue, categoryRevenue, topProducts, ordersByStatus } = data;

  // Chart bar heights
  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
  const maxCategoryTotal = Math.max(...categoryRevenue.map(c => c.total), 1);
  const maxProductSold = Math.max(...topProducts.map(p => p.totalSold), 1);

  const statusColors = {
    'Entregue': '#16a34a',
    'Pago': '#2563eb',
    'Preparando': '#f59e0b',
    'Enviado': '#8b5cf6',
    'Pendente': '#999',
    'Cancelado': '#dc2626',
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="admin-header">
        <Link
          to="/admin/dashboard"
          style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}
        >
          <ArrowLeft size={14} /> Voltar ao Dashboard
        </Link>
        <h1 className="admin-header__title">Relatórios e Métricas</h1>
        <p className="admin-header__subtitle">
          Visão geral do desempenho da loja
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="row g-3 mb-4">
        {[
          {
            icon: <DollarSign size={18} />,
            label: 'Receita Total',
            value: fmtMoney(overview.totalRevenue),
            sub: `${fmtMoney(overview.thisMonthRevenue)} este mês`,
            color: '#16a34a',
          },
          {
            icon: <ShoppingCart size={18} />,
            label: 'Total de Pedidos',
            value: overview.totalOrders,
            sub: `${overview.thisMonthOrders} este mês`,
            color: '#2563eb',
          },
          {
            icon: <TrendingUp size={18} />,
            label: 'Ticket Médio',
            value: fmtMoney(overview.ticketMedio),
            sub: `${overview.revenueGrowth >= 0 ? '+' : ''}${overview.revenueGrowth}% vs mês anterior`,
            color: overview.revenueGrowth >= 0 ? '#16a34a' : '#dc2626',
          },
          {
            icon: <Users size={18} />,
            label: 'Clientes',
            value: overview.totalUsers,
            sub: `+${overview.newUsersThisMonth} novos este mês`,
            color: '#8b5cf6',
          },
        ].map((kpi, i) => (
          <div className="col-md-6 col-xl-3" key={i}>
            <div className="admin-card" style={{ height: '100%' }}>
              <div className="admin-card__body--padded">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${kpi.color}12`, color: kpi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {kpi.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                      {kpi.label}
                    </p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 0 }}>
                      {kpi.value}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: 0, marginTop: 2 }}>
                      {kpi.sub}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Daily Revenue Chart ── */}
      <div className="admin-card mb-4">
        <div className="admin-card__header">
          <h2 className="admin-card__title"><BarChart3 size={16} /> Receita Diária (30 dias)</h2>
        </div>
        <div className="admin-card__body--padded">
          {dailyRevenue.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', padding: 20 }}>
              Sem dados de vendas nos últimos 30 dias.
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 180, overflowX: 'auto', paddingBottom: 24 }}>
              {dailyRevenue.map((d, i) => {
                const pct = (d.revenue / maxDailyRevenue) * 100;
                const date = new Date(d._id + 'T12:00:00');
                const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 18 }} title={`${dayLabel}: ${fmtMoney(d.revenue)} (${d.orders} pedido${d.orders !== 1 ? 's' : ''})`}>
                    <div style={{
                      width: '100%',
                      maxWidth: 28,
                      height: `${Math.max(pct, 4)}%`,
                      background: 'linear-gradient(180deg, #1a1a1a, #444)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      cursor: 'pointer',
                      minHeight: 3,
                    }} />
                    {i % Math.ceil(dailyRevenue.length / 8) === 0 && (
                      <span style={{ fontSize: '0.55rem', color: '#bbb', marginTop: 4, whiteSpace: 'nowrap' }}>
                        {dayLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* ── Category Breakdown ── */}
        <div className="col-md-6">
          <div className="admin-card" style={{ height: '100%' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title"><Package size={16} /> Receita por Categoria</h2>
            </div>
            <div className="admin-card__body--padded">
              {categoryRevenue.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center' }}>Sem dados.</p>
              ) : (
                categoryRevenue.map((cat, i) => {
                  const pct = (cat.total / maxCategoryTotal) * 100;
                  const categoryColors = ['#1a1a1a', '#2563eb', '#f59e0b', '#16a34a', '#8b5cf6', '#dc2626'];
                  const color = categoryColors[i % categoryColors.length];
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div className="d-flex justify-content-between" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{cat._id || 'Sem categoria'}</span>
                        <span style={{ color: '#888' }}>{fmtMoney(cat.total)} · {cat.quantity} un.</span>
                      </div>
                      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Orders by Status ── */}
        <div className="col-md-6">
          <div className="admin-card" style={{ height: '100%' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title"><ShoppingCart size={16} /> Pedidos por Status</h2>
            </div>
            <div className="admin-card__body--padded">
              {ordersByStatus.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center' }}>Sem dados.</p>
              ) : (
                <div className="d-flex flex-wrap gap-3">
                  {ordersByStatus.map((s, i) => (
                    <div key={i} style={{
                      background: '#fafafa', borderRadius: 12, padding: '14px 18px',
                      flex: '1 1 calc(50% - 12px)', minWidth: 130,
                    }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: statusColors[s._id] || '#999',
                        }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s._id}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Products ── */}
      <div className="admin-card mb-4">
        <div className="admin-card__header">
          <h2 className="admin-card__title"><TrendingUp size={16} /> Produtos Mais Vendidos</h2>
        </div>
        <div className="admin-card__body">
          {topProducts.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty__text">Sem dados de vendas.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Vendidos</th>
                    <th>Receita</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => {
                    const pct = (p.totalSold / maxProductSold) * 100;
                    return (
                      <tr key={p._id || i}>
                        <td style={{ width: 40, textAlign: 'center', fontWeight: 800, color: '#bbb', fontSize: '0.85rem' }}>
                          #{i + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {p.image && (
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }}
                              />
                            )}
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {p.name || 'Produto removido'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge--pending" style={{ fontSize: '0.7rem' }}>
                            {p.category || '—'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{p.totalSold}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {fmtMoney(p.totalRevenue)}
                        </td>
                        <td style={{ width: 120 }}>
                          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: 'linear-gradient(90deg, #1a1a1a, #555)',
                              borderRadius: 3, transition: 'width 0.5s',
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
