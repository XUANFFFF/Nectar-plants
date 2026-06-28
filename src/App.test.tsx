import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the participant-centered prototype sections", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("深圳城市绿地传粉动物公民科学项目").length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/当前展示基于示例数据/)).toBeInTheDocument();
    expect(screen.getByText("最新共创观察")).toBeInTheDocument();
    expect(screen.getByText("点开一座城市，看清它的边界与共创热点")).toBeInTheDocument();
    expect(screen.getByText("由观察记录长出来的蜜源植物图鉴")).toBeInTheDocument();
    expect(screen.getByText("你的观察已经进入共创地图")).toBeInTheDocument();
  });
});
