# react-demos

[English](./README.md) | 简体中文

使用 React 编写的示例代码。

- [mdn](https://developer.mozilla.org/)
- [typescript](https://www.typescriptlang.org/)
  - [typescript deep dive](https://basarat.gitbook.io/typescript/)
  - [type challenges](https://github.com/type-challenges/type-challenges)
  - [type-fest](https://github.com/sindresorhus/type-fest)
- [@modyqyw/utils](https://github.com/ModyQyW/utils)
- [tailwindcss](https://tailwindcss.com/)
- [react](https://reactjs.org/)
- [ant-design](https://ant.design/)
- [ahooks](https://ahooks.js.org/)
- [react-use](https://github.com/streamich/react-use)
- [vite](https://vitejs.dev/)
  - [@vitejs/plugin-react](https://github.com/vitejs/vite/tree/main/packages/plugin-react)
  - [vite-plugin-compression](https://github.com/anncwb/vite-plugin-compression)
  - [vite-plugin-env-compatible](https://github.com/IndexXuan/vite-plugin-env-compatible)
  - [vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint)
  - [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
  - [vite-plugin-stylelint](https://github.com/ModyQyW/vite-plugin-stylelint)
  - [vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)

## mine-sweeper

扫雷。

游戏开始时，生成一个固定行数 `rowCount`、固定列数的 `colCount`、固定地雷数 `mineCount` 的矩阵 `matrix`。

行数、列数、地雷数有各自的上下限。地雷密度 `density` 也有上下限。

游戏有三个预设难度 `difficulty`：简单 `easy`（9 行 9 列 10 雷）、中等 `medium`（16 行 16 列 40 雷）、困难 `hard`（16 行 30 列 99 雷）。允许选择自定义 `custom` 难度，也可以直接修改行数、列数、地雷数来自动选择该难度。

游戏有三个状态 `status`：默认 `default`（生成矩阵时）、游玩中 `playing`、已结束 `ended`。

每个矩阵块 `matrixItem` 有三个状态 `matrixItemStatus`：默认 `default`（未翻开）、已标记 `flagged`（认为该块可能是地雷）、已翻开 `opened`。

每个矩阵块 `matrixItem` 有三个类型 `matrixItemType`：地雷 `bomb`、空 `empty`（表示该块周围 8 个块内没有地雷）、数字 `number`（表示该块周围 8 个块内有多少雷）。

左键单击、点击都可以翻开矩阵块 `matrixItem`。翻开地雷类型矩阵块 `matrixItem.type === 'bomb'` 则结束游戏，翻开空类型矩阵块 `matrixItem.type === 'empty'` 则递归翻开与空类型矩阵块相邻的矩阵块并继续游戏，翻开数字类型矩阵块 `matrixItem.type === 'number'` 则继续游戏。

右键单击、长按可以标记矩阵块 `matrixItem`。游戏继续。

### 关键类型说明

- `TDifficulty` 游戏难度
- `TStatus` 游戏状态
- `TMatrixItemStatus` 矩阵块状态
- `TMatrixItemType` 矩阵块类型
- `TMatrixItem` 矩阵块
- `TMatrix` 矩阵

### 关键变量说明

- `MinRowCount` 矩阵最小行数
- `MaxRowCount` 矩阵最大行数
- `MinColCount` 矩阵最小列数
- `MaxColCount` 矩阵最大列数
- `MinMineCount` 矩阵最小雷数
- `MaxMineCount` 矩阵最大雷数
- `MinDensity` 矩阵地雷最小密度
- `MaxDensity` 矩阵地雷最大密度
- `DifficultyMap` 游戏难度参数映射
- `Difficulties` 游戏难度选项数组
- `StatusMap` 游戏状态映射
- `MatrixItemStatusMap` 矩阵块状态映射
- `MatrixItemTypeMap` 矩阵块类型映射

### 关键实现说明

- [可选链运算符 optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [空值合并运算符 nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)
- [逻辑空赋值运算符 logical nullish assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment)
- [非空断言运算符 non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator)
- 递归翻开与空类型矩阵块相邻的矩阵块并继续游戏

下面使用广度优先搜索 bfs 的思想处理。

假定空类型矩阵块 `matrixItem.type === 'empty'` 所在行为 `row`，所在列为 `col`。

创建一个新的矩阵。

```ts
const newMatrix = [...matrix];
```

使用队列存储需要查验的位置，具体实现可以使用数组。

```ts
let queue = [{ row, col }];
```

循环地从队列头取出元素，修改对应位置的矩阵块状态为已翻开 `opened`。

```ts
while (queue.length > 0) {
  // 取出队头元素
  const { row: tmpRow, col: tmpCol } = queue.shift()!;
  // 修改对应位置的矩阵块状态为已翻开 opened
  if (newMatrix[tmpRow][tmpCol].status !== MatrixItemStatusMap.opened) {
    newMatrix[tmpRow][tmpCol].status = MatrixItemStatusMap.opened;
  }
  ...
}
```

如果该位置为数字类型矩阵块，无需额外操作。

如果该位置为空类型矩阵块，则进行二重遍历，把新的需要查验的位置推入数组。利用运算符可以简洁地排除越界的情况。

```ts
while (queue.length > 0) {
  // 取出队头元素
  const { row: tmpRow, col: tmpCol } = queue.shift()!;
  // 修改对应位置的矩阵块状态为已翻开 opened
  if (newMatrix[tmpRow][tmpCol].status !== MatrixItemStatusMap.opened) {
    newMatrix[tmpRow][tmpCol].status = MatrixItemStatusMap.opened;
  }
  // 如果该位置为空类型矩阵块，则进行二重遍历，把新的需要查验的位置推入数组
  if (newMatrix[tmpRow][tmpCol].type === MatrixItemTypeMap.empty) {
    for (let i = tmpRow - 1; i <= tmpRow + 1; i += 1) {
      for (let j = tmpCol - 1; j <= tmpCol + 1; j += 1) {
        if (
          // 注意：不能使用 !== MatrixItemStatusMap.opened，否则越界位置仍会被推入数组
          newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.default ||
          newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.flagged
        ) {
          queue.push({ row: i, col: j });
        }
      }
    }
    ...
  }
}
```

之后对数组去重，继续循环。

```ts
while (queue.length > 0) {
  // 取出队头元素
  const { row: tmpRow, col: tmpCol } = queue.shift()!;
  // 修改对应位置的矩阵块状态为已翻开 opened
  if (newMatrix[tmpRow][tmpCol].status !== MatrixItemStatusMap.opened) {
    newMatrix[tmpRow][tmpCol].status = MatrixItemStatusMap.opened;
  }
  // 如果该位置为空类型矩阵块，则进行二重遍历，把新的需要查验的位置推入数组
  if (newMatrix[tmpRow][tmpCol].type === MatrixItemTypeMap.empty) {
    for (let i = tmpRow - 1; i <= tmpRow + 1; i += 1) {
      for (let j = tmpCol - 1; j <= tmpCol + 1; j += 1) {
        if (
          // 注意：不能使用 !== MatrixItemStatusMap.opened，否则越界位置仍会被推入数组
          newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.default ||
          newMatrix?.[i]?.[j]?.status === MatrixItemStatusMap.flagged
        ) {
          queue.push({ row: i, col: j });
        }
      }
    }
    // 去重
    queue = uniqWith(queue, isEqual);
  }
}
```

最后更新矩阵即可。

```ts
setMatrix(newMatrix);
```

- 矩阵块的文本显示

矩阵块的文本显示需要根据游戏状态、矩阵块状态和矩阵块类型判断。

如果矩阵块状态是默认 `default`，那么当游戏状态是已结束 `ended` 且矩阵块类型是炸弹 `bomb` 时，显示 `💣`，其余情况显示空字符串。

如果矩阵块状态是已标记 `flagged`，那么当游戏状态是已结束 `ended` 且矩阵块类型是炸弹 `bomb`，显示 `💣`，其余情况显示 `⚠️`。

如果矩阵块状态是已翻开 `opened`，矩阵块类型是炸弹 `bomb` 时显示 `💣`，矩阵块类型是数字 `number` 时二重循环计算周围雷数并显示，矩阵块类型是空 `empty` 时显示空字符串。

其余情况显示空字符串。实际上，上面已经判断了所有情况。

- 判断游戏结束

只有当游戏状态不是已结束 `ended`，且矩阵内存在元素 `matrix.length > 0`，且矩阵内不存在矩阵块状态是已翻开 `opened` 且矩阵块类型是炸弹 `bomb` 的矩阵块，游戏结束。

## fetch

使用 fetch 请求 github 或 gitee 仓库搜索 API，可更改关键字，有简单的缓存。

### 关键类型说明

- `TService` 服务
- `TRepository` 仓库
- `TCache` 缓存

### 关键变量说明

- `ServiceMap` 服务映射
- `Services` 服务选项数组
- `Limit` 每页数据条数

### 关键实现说明

- 缓存的键

发起查询时，我们需要用到服务 `service`、当前页 `page`、关键字 `keyword` 来确定我们请求的 URL，可以使用这三者作为缓存的键。

```ts
const getCacheKey = (service: TService, param: Record<string, any>) =>
  JSON.stringify([service, param]);
```

思路参考了 [react-query](https://react-query.tanstack.com/)。
