/* eslint-disable react/no-array-index-key, jsx-a11y/click-events-have-key-events */
import { memo, useState, useEffect, useCallback } from 'react';
import { Typography, Form, Select, InputNumber, Button, Row, Col } from 'antd';
import { Icon } from '@iconify/react';
import {
  MinRowCount,
  MaxRowCount,
  MinColCount,
  MaxColCount,
  MinMineCount,
  MaxMineCount,
  DifficultyMap,
  Difficulties,
  type TDifficulty,
  type TParam,
  PresetMap,
  StatusMap,
  type TStatus,
  MatrixItemStatusMap,
  MatrixItemTypeMap,
  type TMatrix,
  type TMatrixItem,
} from '@/constants';
import { isEqual, uniqWith, randomInteger } from '@/utils';

const { Paragraph } = Typography;

const initialFormValues: TParam = {
  ...PresetMap.easy,
};

const MineSweeper = memo(() => {
  const [status, setStatus] = useState<TStatus>(StatusMap.default);

  const [matrix, setMatrix] = useState<TMatrix>([]);
  const getMatrixItemText = useCallback(
    (row: number, col: number) => {
      const matrixItem = matrix[row][col];
      // MatrixItemStatusMap.default
      if (matrixItem.status === MatrixItemStatusMap.default) {
        if (matrixItem.type === MatrixItemTypeMap.bomb && status === StatusMap.ended) {
          return '💣';
        }
        return '';
      }
      // MatrixItemStatusMap.flagged
      if (matrixItem.status === MatrixItemStatusMap.flagged) {
        if (matrixItem.type === MatrixItemTypeMap.bomb && status === StatusMap.ended) {
          return '💣';
        }
        return <Icon className="anticon" icon="emojione:warning" />;
      }
      // MatrixItemStatusMap.opened
      if (matrixItem.type === MatrixItemTypeMap.bomb) {
        return '💣';
      }
      if (matrixItem.type === MatrixItemTypeMap.number) {
        let sum = 0;
        for (let i = row - 1; i <= row + 1; i += 1) {
          for (let j = col - 1; j <= col + 1; j += 1) {
            sum += matrix?.[i]?.[j]?.type === MatrixItemTypeMap.bomb ? 1 : 0;
          }
        }
        return sum;
      }
      return '';
    },
    [matrix, status],
  );
  const onClickMatrixItem = useCallback(
    (row: number, col: number) => {
      if (status !== StatusMap.ended && matrix[row][col].status !== MatrixItemStatusMap.opened) {
        setStatus(StatusMap.playing);
        const newMatrix = [...matrix];
        if (
          newMatrix[row][col].type === MatrixItemTypeMap.bomb ||
          newMatrix[row][col].type === MatrixItemTypeMap.number
        ) {
          if (newMatrix[row][col].type === MatrixItemTypeMap.bomb) {
            setStatus(StatusMap.ended);
          }
          newMatrix[row][col].status = MatrixItemStatusMap.opened;
        } else {
          let queue = [{ row, col }];
          while (queue.length > 0) {
            const { row: tmpRow, col: tmpCol } = queue.shift()!;
            if (newMatrix[tmpRow][tmpCol].status !== MatrixItemStatusMap.opened) {
              newMatrix[tmpRow][tmpCol].status = MatrixItemStatusMap.opened;
            }
            if (newMatrix[tmpRow][tmpCol].type === MatrixItemTypeMap.empty) {
              for (let i = tmpRow - 1; i <= tmpRow + 1; i += 1) {
                for (let j = tmpCol - 1; j <= tmpCol + 1; j += 1) {
                  if (
                    newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.default ||
                    newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.flagged
                  ) {
                    queue.push({ row: i, col: j });
                  }
                }
              }
              queue = uniqWith(queue, isEqual);
            }
          }
        }
        setMatrix(newMatrix);
      }
    },
    [matrix, status],
  );
  const onRightClickMatrixItem = useCallback(
    (row: number, col: number) => {
      if (status !== StatusMap.ended && matrix[row][col].status !== MatrixItemStatusMap.opened) {
        setStatus(StatusMap.playing);
        const newMatrix = [...matrix];
        newMatrix[row][col].status =
          newMatrix[row][col].status === MatrixItemStatusMap.default
            ? MatrixItemStatusMap.flagged
            : MatrixItemStatusMap.default;
        setMatrix(newMatrix);
      }
    },
    [matrix, status],
  );
  useEffect(() => {
    if (
      status !== StatusMap.ended &&
      matrix.length > 0 &&
      matrix.filter((rowItem) =>
        rowItem.some(
          (matrixItem) =>
            matrixItem.status !== MatrixItemStatusMap.opened &&
            matrixItem.type !== MatrixItemTypeMap.bomb,
        ),
      ).length === 0
    ) {
      setStatus(StatusMap.ended);
    }
  }, [matrix, status]);

  const [form] = Form.useForm<TParam>();
  const onChangeFormFieldsValue = () => {
    const { rowCount, colCount, mineCount } = form.getFieldsValue();
    form.setFieldsValue({
      difficulty:
        Object.values(PresetMap).find(
          (item) =>
            item.rowCount === rowCount &&
            item.colCount === colCount &&
            item.mineCount === mineCount,
        )?.difficulty ?? DifficultyMap.custom,
    });
  };
  const onFinish = async () => {
    const { rowCount, colCount, mineCount } = await form.validateFields();
    const newMatrix: TMatrix = Array.from({ length: rowCount }).map(() =>
      Array.from({ length: colCount }).map(
        () =>
          ({
            type: MatrixItemTypeMap.empty,
            status: MatrixItemStatusMap.default,
          } as TMatrixItem),
      ),
    );
    let nowMineCount = 0;
    while (nowMineCount < mineCount) {
      const row = randomInteger(0, rowCount);
      const col = randomInteger(0, colCount);
      if (newMatrix[row][col].type !== MatrixItemTypeMap.bomb) {
        newMatrix[row][col].type = MatrixItemTypeMap.bomb;
        for (let i = row - 1; i <= row + 1; i += 1) {
          for (let j = col - 1; j <= col + 1; j += 1) {
            if (newMatrix?.[i]?.[j]?.type === MatrixItemTypeMap.empty) {
              newMatrix[i][j].type = MatrixItemTypeMap.number;
            }
          }
        }
        nowMineCount += 1;
      }
    }
    setMatrix(newMatrix);
    setStatus(StatusMap.default);
  };
  useEffect(() => {
    form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Form
        className="justify-center"
        form={form}
        colon={false}
        initialValues={initialFormValues}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12} lg={5}>
            <Form.Item
              name="difficulty"
              label="Difficulty"
              rules={[
                {
                  type: 'enum',
                  enum: Object.keys(DifficultyMap),
                  required: true,
                  message: 'Please select',
                },
              ]}
            >
              <Select
                options={Difficulties}
                onChange={(difficulty: TDifficulty) =>
                  form.setFieldsValue({ ...PresetMap[difficulty] })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12} lg={5}>
            <Form.Item
              name="rowCount"
              label="Row"
              rules={[
                {
                  type: 'number',
                  min: MinRowCount,
                  max: MaxRowCount,
                  required: true,
                  message: `Should between ${MinRowCount} and ${MaxRowCount}`,
                },
              ]}
            >
              <InputNumber
                min={MinRowCount}
                max={MaxRowCount}
                onChange={onChangeFormFieldsValue}
                precision={0}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12} lg={5}>
            <Form.Item
              name="colCount"
              label="Column"
              rules={[
                {
                  type: 'number',
                  min: MinColCount,
                  max: MaxColCount,
                  required: true,
                  message: `Should between ${MinColCount} and ${MaxColCount}`,
                },
              ]}
            >
              <InputNumber
                min={MinColCount}
                max={MaxColCount}
                onChange={onChangeFormFieldsValue}
                precision={0}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12} lg={5}>
            <Form.Item
              name="mineCount"
              label="Mine"
              rules={[
                {
                  type: 'number',
                  min: MinMineCount,
                  max: MaxMineCount,
                  required: true,
                  message: `Should between ${MinMineCount} and ${MaxMineCount}`,
                },
              ]}
            >
              <InputNumber
                min={MinMineCount}
                max={MaxMineCount}
                onChange={onChangeFormFieldsValue}
                precision={0}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={24} lg={4} className="text-center lg:text-left">
            <Form.Item>
              <Button type="primary" htmlType="submit" className="mr-2">
                Start
              </Button>
              <Button htmlType="button" onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Row className="flex-col my-4 overflow-x-auto">
        {matrix.map((rowItem, row) => (
          <Row key={row} className="mx-auto flex-nowrap">
            {rowItem.map((matrixItem, col) => (
              <div
                key={col}
                className={`flex justify-center items-center w-5 h-5 m-px cursor-pointer transition flex-none ${
                  matrixItem.status === MatrixItemStatusMap.opened &&
                  matrixItem.type === MatrixItemTypeMap.bomb
                    ? 'bg-red-300'
                    : ''
                } ${
                  matrixItem.status === MatrixItemStatusMap.opened &&
                  matrixItem.type !== MatrixItemTypeMap.bomb
                    ? 'bg-gray-300'
                    : ''
                } ${matrixItem.status !== MatrixItemStatusMap.opened ? 'bg-gray-400' : ''}`}
                role="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClickMatrixItem(row, col);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRightClickMatrixItem(row, col);
                }}
              >
                {getMatrixItemText(row, col)}
              </div>
            ))}
          </Row>
        ))}
      </Row>
      {status === StatusMap.ended && <Paragraph className="text-center">Game Over :D</Paragraph>}
    </>
  );
});

export default MineSweeper;
/* eslint-enable react/no-array-index-key, jsx-a11y/click-events-have-key-events */
