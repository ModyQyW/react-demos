/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Input, Select, Button, List, Typography, Popconfirm } from 'antd';
import { Icon } from '@iconify/react';
import { objectKeys } from '@/utils';

// codeStorage
const codeStorage = {} as any;
codeStorage.clear = () => {
  Object.keys(codeStorage).forEach((key) => {
    delete codeStorage[key];
    codeStorage.length = Object.keys(codeStorage).length - 6;
  });
};
codeStorage.getItem = (key: string): string | null => codeStorage[key] ?? null;
codeStorage.key = (index: number) => Object.keys(codeStorage)?.[index] ?? null;
codeStorage.removeItem = (key: string) => {
  delete codeStorage[key];
  codeStorage.length = Object.keys(codeStorage).length - 6;
};
codeStorage.setItem = (key: string, value: string) => {
  codeStorage[key] = value;
  codeStorage.length = Object.keys(codeStorage).length - 6;
};
codeStorage.length = 0;

const StorageMap = {
  codeStorage: codeStorage as Storage,
  localStorage,
  sessionStorage,
} as const;
type TStorage = keyof typeof StorageMap;
const DefaultStorage: TStorage = 'codeStorage';
const Storages = objectKeys(StorageMap).map((key) => ({
  label: key,
  value: key,
}));

const StorageKey = 'storage';

const MemosKey = 'memos';

const MemoStatusMap = {
  done: {
    order: 2,
    buttonIcon: 'ant-design:check-circle-outlined',
    statusIcon: 'ant-design:check-circle-filled',
    statusIconColor: '#52c41a',
  },
  doing: {
    order: 0,
    buttonIcon: 'eos-icons:bubble-loading',
    statusIcon: 'eos-icons:bubble-loading',
    statusIconColor: '#1890ff',
  },
  todo: {
    order: 1,
    buttonIcon: 'ant-design:info-circle-outlined',
    statusIcon: 'ant-design:info-circle-filled',
    statusIconColor: '#722ed1',
  },
} as const;
type TMemoStatus = keyof typeof MemoStatusMap;
type TMemo = {
  id: string;
  title: string;
  status: TMemoStatus;
};
type TMemos = TMemo[];
const MemoSortFunction = (memoA: TMemo, memoB: TMemo) =>
  MemoStatusMap[memoA.status].order - MemoStatusMap[memoB.status].order === 0
    ? Number.parseInt(memoA.id, 10) - Number.parseInt(memoB.id, 10)
    : MemoStatusMap[memoA.status].order - MemoStatusMap[memoB.status].order;

const Memo = React.memo(() => {
  const [storage, setStorage] = useState(
    () =>
      (objectKeys(StorageMap).includes(
        (localStorage.getItem(StorageKey) ?? DefaultStorage) as TStorage,
      )
        ? localStorage.getItem(StorageKey) ?? DefaultStorage
        : DefaultStorage) as TStorage,
  );
  const onSetStorage = useCallback((value: TStorage) => {
    setStorage(value);
    localStorage.setItem(StorageKey, value);
  }, []);

  const [memos, setMemos] = useState<TMemos>([]);
  useEffect(() => {
    try {
      const newMemos = JSON.parse(StorageMap[storage].getItem(MemosKey) ?? '[]');
      setMemos(newMemos.sort(MemoSortFunction));
    } catch {
      setMemos([]);
    }
  }, [storage]);

  const [title, setTitle] = useState('');
  const onAddTitle = useCallback(() => {
    const newMemos = [
      ...memos,
      {
        id: `${+Date.now()}${Number.parseInt((Math.random() * 1000).toFixed(0), 10)}`,
        title,
        status: 'todo',
      } as TMemo,
    ].sort(MemoSortFunction);
    setMemos(newMemos);
    setTitle('');
    StorageMap[storage].setItem(MemosKey, JSON.stringify(newMemos));
  }, [memos, title, storage]);

  const onSync = useCallback(() => {
    objectKeys(StorageMap).forEach((item) => {
      StorageMap[item].setItem(MemosKey, JSON.stringify(memos));
    });
  }, [memos]);

  const onClear = useCallback(() => {
    setMemos([]);
    objectKeys(StorageMap).forEach((item) => {
      StorageMap[item].removeItem(MemosKey);
    });
  }, []);

  const onTodoMemo = useCallback(
    (memo: TMemo) => {
      const index = memos.findIndex((item) => item.id === memo.id);
      const newMemos = [
        ...memos.slice(0, index),
        { ...memo, status: 'todo' as TMemoStatus },
        ...memos.slice(index + 1),
      ].sort(MemoSortFunction);
      setMemos(newMemos);
      StorageMap[storage].setItem(MemosKey, JSON.stringify(newMemos));
    },
    [memos, storage],
  );

  const onDoingMemo = useCallback(
    (memo: TMemo) => {
      const index = memos.findIndex((item) => item.id === memo.id);
      const newMemos = [
        ...memos.slice(0, index),
        { ...memo, status: 'doing' as TMemoStatus },
        ...memos.slice(index + 1),
      ].sort(MemoSortFunction);
      setMemos(newMemos);
      StorageMap[storage].setItem(MemosKey, JSON.stringify(newMemos));
    },
    [memos, storage],
  );

  const onDoneMemo = useCallback(
    (memo: TMemo) => {
      const index = memos.findIndex((item) => item.id === memo.id);
      const newMemos = [
        ...memos.slice(0, index),
        { ...memo, status: 'done' as TMemoStatus },
        ...memos.slice(index + 1),
      ].sort(MemoSortFunction);
      setMemos(newMemos);
      StorageMap[storage].setItem(MemosKey, JSON.stringify(newMemos));
    },
    [memos, storage],
  );

  const onRemoveMemo = useCallback(
    (memo: TMemo) => {
      const index = memos.findIndex((item) => item.id === memo.id);
      const newMemos = [...memos.slice(0, index), ...memos.slice(index + 1)];
      setMemos(newMemos);
      StorageMap[storage].setItem(MemosKey, JSON.stringify(newMemos));
    },
    [memos, storage],
  );

  return (
    <>
      <Row justify="center">
        <Col span={24} lg={12}>
          <Input.Group compact>
            <Select
              style={{ width: '150px' }}
              value={storage}
              onChange={onSetStorage}
              options={Storages}
            />
            <Input
              style={{ width: 'calc(100% - 334px)' }}
              value={title}
              allowClear
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              onPressEnter={onAddTitle}
            />
            <Button type="primary" style={{ width: '60px' }} onClick={onAddTitle}>
              Add
            </Button>
            <Popconfirm title="Are you sure to sync memos to other storages?" onConfirm={onSync}>
              <Button style={{ width: '60px' }}>Sync</Button>
            </Popconfirm>
            <Popconfirm title="Are you sure to clear storages?" onConfirm={onClear}>
              <Button style={{ width: '64px' }}>Clear</Button>
            </Popconfirm>
          </Input.Group>
        </Col>
      </Row>
      <Row justify="center" className="mt-4">
        <Col span={24} lg={12}>
          <List
            bordered
            dataSource={memos}
            renderItem={(item) => (
              <List.Item key={item.id} className="flex flex-row">
                <Icon
                  className="flex-none anticon"
                  icon={MemoStatusMap[item.status].statusIcon}
                  color={MemoStatusMap[item.status].statusIconColor}
                />
                <Typography.Text className="mx-2 break-all">{item.title}</Typography.Text>
                <div className="flex-auto" />
                {item.status !== 'todo' && (
                  <Button
                    className="flex-none"
                    type="text"
                    shape="circle"
                    icon={<Icon className="mx-auto anticon" icon={MemoStatusMap.todo.buttonIcon} />}
                    onClick={() => onTodoMemo(item)}
                  />
                )}
                {item.status !== 'doing' && (
                  <Button
                    className="flex-none"
                    type="text"
                    shape="circle"
                    icon={
                      <Icon className="mx-auto anticon" icon={MemoStatusMap.doing.buttonIcon} />
                    }
                    onClick={() => onDoingMemo(item)}
                  />
                )}
                {item.status !== 'done' && (
                  <Button
                    className="flex-none"
                    type="text"
                    shape="circle"
                    icon={<Icon className="mx-auto anticon" icon={MemoStatusMap.done.buttonIcon} />}
                    onClick={() => onDoneMemo(item)}
                  />
                )}
                <Button
                  className="flex-none"
                  type="text"
                  shape="circle"
                  icon={<Icon className="mx-auto anticon" icon="ant-design:delete-outlined" />}
                  onClick={() => onRemoveMemo(item)}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </>
  );
});

export default Memo;
/* eslint-enable @typescript-eslint/no-unused-vars */
