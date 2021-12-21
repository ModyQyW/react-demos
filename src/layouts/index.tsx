import { memo, useMemo, type ReactNode } from 'react';
import { Layout, Space, Typography, Row, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import pages from '~react-pages';
import pkg from '@/../package.json';

const { Header, Content, Footer } = Layout;
const { Title, Link } = Typography;

const routes = pages.filter((page) => !page.index).map((route) => route?.path ?? '');

const LayoutIndex = memo(({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKeys = useMemo(
    () => routes.filter((route) => `/${route}` === location.pathname),
    [location],
  );
  return (
    <Layout className="min-h-screen">
      <Header className="fixed z-10 w-full" style={{ padding: '0 12px' }}>
        <Row align="middle" className="h-full flex-nowrap">
          <Title level={5} className="!text-white !mb-0 mx-4 flex-none">
            {pkg.name}
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            className="flex-auto"
            selectedKeys={selectedKeys}
            onClick={({ key }) => {
              navigate(`/${key}`);
            }}
          >
            {routes.map((route) => (
              <Menu.Item key={route}>{route}</Menu.Item>
            ))}
          </Menu>
        </Row>
      </Header>
      <Content style={{ marginTop: 64, padding: 12 }}>{children}</Content>
      <Footer>
        <Row justify="center">v{pkg.version}</Row>
        <Row justify="center">
          <Space size="large">
            <Link href={`https://github.com/${pkg.author.name}/${pkg.name}`} target="_blank">
              Github Repo
            </Link>
            <Link href={`https://gitee.com/${pkg.author.name}/${pkg.name}`} target="_blank">
              Gitee Repo
            </Link>
            <Link href={`https://${pkg.author.name}.github.io/${pkg.name}/`} target="_blank">
              Github Page
            </Link>
            <Link href={`https://${pkg.author.name}.gitee.io/${pkg.name}/`} target="_blank">
              Gitee Page
            </Link>
          </Space>
        </Row>
      </Footer>
    </Layout>
  );
});

export default LayoutIndex;
