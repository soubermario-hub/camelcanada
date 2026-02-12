import { Link, Outlet } from 'react-router-dom';

const navItems = ['Dashboard','Banking','Sales','Expenses','Payroll','Reports','Taxes','Accounting','Settings'];
const quickItems = [
  'Invoice','Receive payment','Estimate','Sales receipt','Refund receipt','Add customer',
  'Expense','Bill','Pay bills','Vendor credit','Add vendor',
  'Bank deposit','Transfer','Reconciliation','Journal entry','Chart of accounts',
  'Invite member','Create user'
];

export function Layout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #ddd', padding: 16 }}>
        {navItems.map((item) => <div key={item}><Link to={`/${item.toLowerCase()}`}>{item}</Link></div>)}
      </aside>
      <main>
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #ddd' }}>
          <input placeholder="Search" />
          <div>
            <button>Notifications</button>
            <details style={{ display: 'inline-block', marginLeft: 12 }}>
              <summary>+ New</summary>
              <div style={{ border: '1px solid #ddd', padding: 8, background: 'white', position: 'absolute' }}>
                {quickItems.map((item) => (
                  <div key={item}><Link to={`/coming-soon/${encodeURIComponent(item.toLowerCase())}`}>{item}</Link></div>
                ))}
              </div>
            </details>
          </div>
        </header>
        <div style={{ padding: 16 }}><Outlet /></div>
      </main>
    </div>
  );
}
