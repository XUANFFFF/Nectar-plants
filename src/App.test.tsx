import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the participant-centered prototype sections", () => {
    render(<App />);

    expect(screen.getAllByText("城市蜜源共创地图").length).toBeGreaterThan(0);
    expect(screen.getByText(/我们一起点亮城市里的蜜源线索/)).toBeInTheDocument();
    expect(screen.getByText("最新共创观察")).toBeInTheDocument();
    expect(screen.getByText("点开一座城市，看清它的边界与共创热点")).toBeInTheDocument();
    expect(screen.getByText("由观察记录长出来的蜜源植物图鉴")).toBeInTheDocument();
    expect(screen.getByText("你的观察已经进入共创地图")).toBeInTheDocument();
  });
});
