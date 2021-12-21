import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/antd.variable.min.css';
import { HashRouter, useRoutes } from 'react-router-dom';
import '@/styles/global.css';
import browserUpdate from 'browser-update';
import routes from '~react-pages';
import Layout from '@/layouts';

browserUpdate({
  required: { e: 79, f: 67, o: 50, s: 12, c: 63 },
  insecure: true,
  unsupported: true,
});

function App() {
  return useRoutes(routes);
}

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <Layout>
          <App />
        </Layout>
      </HashRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.querySelector('#root'),
);
