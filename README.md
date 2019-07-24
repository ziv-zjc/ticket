

### 需求理解
系统随机为用户分配座位，并不用真正随机。对标12306购票
场馆各区均匀排布，同人购票尽量连坐，不跨区。

### 技术点
react+ts+canvas

### 主要逻辑
1. 整体结构分为三层：Seat -> Section -> Scene。每次选票抽象为：
    1. 场馆级调度(Scene.select) 
    2. 分区级调度(Section.select)
    可以方便地进行每个级别调度算法的迭代或替换
2. 选座时从坐下角0，0位置开始，在能够保证用户连坐的情况下，依次选取位置。当前行不满足要求的情况下，进行换行选择
3. 换行所产生的空座被记录在列，后续输入购票数时优先从空座表中查询空座信息，进行补位。
4. 为保证各区域选座均匀。为区域设置阈值m，当行数>m时，切换下个区域继续选择。当所有区域行数都为m时，更新阈值从头继续选择。
5. 最后连坐不够的时，再把空座挨个选掉

### 可扩展
1. 当场馆变化、座位数、行数、列数、分区数量、购票数变化，依旧可以支持。
2. 内场空出（尚未实现）

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
