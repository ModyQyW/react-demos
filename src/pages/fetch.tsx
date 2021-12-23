import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Input, Select, Result, Table, Typography } from 'antd';

const { Link } = Typography;

const ServiceMap = {
  github: 'https://api.github.com/search/repositories',
  gitee: 'https://gitee.com/api/v5/search/repositories',
} as const;
type TService = keyof typeof ServiceMap;
const Services: TOption<TService>[] = (Object.keys(ServiceMap) as Array<TService>).map((item) => ({
  label: item,
  value: item,
}));

const Limit = 10;

type TRepository = {
  id: number;
  full_name: string;
  url: string;
  stargazers_count: number;
  forks_count: number;
};

type TCache = Record<string, TRepository[]>;

const getCacheKey = (service: TService, param: Record<string, any>) =>
  JSON.stringify([service, param]);

const Fetch = memo(() => {
  const cacheRef = useRef<TCache>({});
  const [repositories, setRepositories] = useState<TRepository[]>([]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [service, setService] = useState<TService>('github');
  const [keyword, setKeyword] = useState('react');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const onSearch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const key = getCacheKey(service, { keyword, page });
    if (cacheRef.current[key]) {
      setRepositories(cacheRef.current[key]);
      setIsLoading(false);
      return;
    }
    fetch(`${ServiceMap[service]}?q=${keyword}&page=${page}&per_page=${Limit}`)
      .then((response) => {
        if (response.ok) {
          const newTotal = response.headers.get('total_count') ?? '';
          if (!Number.isNaN(Number.parseInt(newTotal, 10))) {
            setTotal(Number.parseInt(newTotal, 10));
          }
        }
        return response.json();
      })
      .then((data) => {
        if (data.message && data.documentation_url) {
          setError(new Error(`${data.message} ${data.documentation_url}`));
          setRepositories([]);
        } else {
          if (data.total_count) {
            setTotal(data.total_count);
          }
          setRepositories(data.items ?? data);
          cacheRef.current[key] = data.items ?? data;
        }
      })
      .catch((newError) => {
        setError(newError);
        setRepositories([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [keyword, page, service]);
  const onChangePagination = (newPage: number) => {
    setPage(newPage);
  };
  useEffect(() => {
    onSearch();
  }, [onSearch]);

  return (
    <>
      <Row justify="center">
        <Col span={24} lg={12}>
          <Input.Search
            addonBefore={
              <Select
                value={service}
                onChange={(value) => {
                  setService(value);
                  setPage(1);
                }}
                options={Services}
              />
            }
            defaultValue={keyword}
            enterButton
            onSearch={(value) => {
              setKeyword(value);
            }}
          />
        </Col>
      </Row>
      <Row justify="center">
        <Col span={24} lg={12}>
          {!isLoading && error && (
            <Result status="error" title={error?.message ?? error ?? 'Unknown Error'} />
          )}
          <Table
            loading={isLoading}
            className="mt-4"
            dataSource={repositories}
            rowKey="id"
            size="small"
            pagination={{
              current: page,
              pageSize: Limit,
              total,
              size: 'small',
              position: ['topCenter', 'bottomCenter'],
              showSizeChanger: false,
              onChange: onChangePagination,
            }}
            columns={[
              {
                title: 'Name',
                dataIndex: 'full_name',
                ellipsis: true,
                // @ts-ignore
                render: (text, record) => (
                  <Link href={record.url} target="_blank">
                    {record.full_name}
                  </Link>
                ),
              },
              {
                title: 'Stars',
                dataIndex: 'stargazers_count',
                width: 80,
              },
              {
                title: 'Forks',
                dataIndex: 'forks_count',
                width: 80,
              },
            ]}
          />
        </Col>
      </Row>
    </>
  );
});

export default Fetch;
