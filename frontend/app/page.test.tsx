import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth";
import Page from "./page";

describe("Home page", () => {
  it("renders without crashing", () => {
    render(
      <AuthProvider>
        <Page />
      </AuthProvider>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
