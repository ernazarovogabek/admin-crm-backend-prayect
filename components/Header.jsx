'use client'

import { Typography } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";

const { Title } = Typography;

function Header({ title }) {
  return (
    <div className="flex items-center gap-2 mt-[-100px]">
      <AppstoreOutlined style={{ fontSize: "20px" }} />
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
    </div>
  );
}

export default Header;