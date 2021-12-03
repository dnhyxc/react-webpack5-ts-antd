import React from "react";
import { Button } from "antd";
import styles from "./App.less";

const App = () => {
  return (
    <div className={styles.container}>
      <Button type="primary">终于生效了</Button>
      <div className={styles.title}>aaaa</div>
    </div>
  );
};

export default App;
