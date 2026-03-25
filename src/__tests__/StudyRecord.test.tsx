import { beforeEach, describe, expect, test, vi } from "vitest";
import { render } from "@/test-utils/render";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StudyRecord } from "../StudyRecord";
import { Record } from "@/domain/record";

const mockInitRecords = [
  new Record("1", "test1", 10),
  new Record("2", "test2", 20),
];

const mockRecords = vi.fn().mockResolvedValue(mockInitRecords);

vi.mock("@/lib/record", () => {
  return {
    GetAllRecords: () => mockRecords(),
    InsertRecord: vi.fn(async (record: Record) => {
      mockInitRecords.push(record);
    }),
    DeleteRecord: vi.fn(async (id: string) => {
      const index = mockInitRecords.findIndex((record) => record.id === id);
      if (index !== -1) {
        mockInitRecords.splice(index, 1);
      }
    }),
    UpdateRecord: vi.fn(async (record: Record) => {
      const index = mockInitRecords.findIndex((r) => r.id === record.id);
      if (index !== -1) {
        mockInitRecords[index] = record;
      }
    })
  };
});

describe("シン・学習記録アプリ", () => {
  beforeEach(() => {
    mockInitRecords.length = 0;
    mockInitRecords.push(
      new Record("1", "test1", 10),
      new Record("2", "test2", 20)
    );
    render(<StudyRecord />);
  });

  test("ローディングが表示されていること", async () => {
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("テーブルを見ることができる", async () => {
    const table = await screen.findByRole("table");
    const tr = table.querySelectorAll("tbody tr");
    expect(tr.length).toBe(2);
  });

  test("新規登録ボタンがある", async () => {
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "新規登録" })).toBeInTheDocument();
    });
  });

  test("タイトルがあること", async () => {
    expect(await screen.findByRole("heading", { name: "学習記録アプリ" })).toBeInTheDocument();
  });

  test("登録できること", async () => {
    const before = await screen.findAllByTestId("record");

    const openAddModalButton = await screen.findByRole("button", { name: "新規登録" });
    fireEvent.click(openAddModalButton);
    const inputTitle = await screen.findByLabelText("学習内容");
    const inputTime = await screen.findByLabelText("学習時間");
    const submitButton = await screen.findByRole("button", { name: "登録" });

    // テスト用の記録を入力して登録
    fireEvent.change(inputTitle, {
      target: { value: "テスト記録" },
    });
    fireEvent.change(inputTime, {
      target: { value: "2" },
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(async () => {
      const after = await screen.findAllByTestId("record");
      expect(after.length).toBe(before.length + 1);
    });
  });

  test("モーダルのタイトルが「新規登録」であること", async () => {
    const openAddModalButton = await screen.findByRole("button", { name: "新規登録" });
    fireEvent.click(openAddModalButton);
    const dialogTitle = await screen.findByRole("heading", {
      name: "新規登録",
    });
    expect(dialogTitle).toBeInTheDocument();
  });

  test("学習内容がないときに登録するとエラーがでること", async () => {
    const openAddModalButton = await screen.findByRole("button", { name: "新規登録" });
    fireEvent.click(openAddModalButton);
    const inputTime = await screen.findByLabelText("学習時間");
    const submitButton = await screen.findByRole("button", { name: "登録" });

    fireEvent.change(inputTime, {
      target: { value: "2" },
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const errorMessage = screen.getByText('内容の入力は必須です');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test("学習時間がないときに登録するとエラーがでること", async () => {
    const openAddModalButton = await screen.findByRole("button", { name: "新規登録" });
    fireEvent.click(openAddModalButton);
    const inputTitle = await screen.findByLabelText("学習内容");
    const submitButton = await screen.findByRole("button", { name: "登録" });

    fireEvent.change(inputTitle, {
      target: { value: "テスト記録" },
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(async () => {
      const errorMessage = screen.getByText('時間の入力は必須です');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test("学習時間が0以上でないときに登録するとエラーがでること", async () => {
    const openAddModalButton = await screen.findByRole("button", { name: "新規登録" });
    fireEvent.click(openAddModalButton);
    const inputTitle = await screen.findByLabelText("学習内容");
    const inputTime = await screen.findByLabelText("学習時間");
    const submitButton = await screen.findByRole("button", { name: "登録" });

    // テスト用の記録を入力して登録
    fireEvent.change(inputTitle, {
      target: { value: "テスト記録" },
    });
    fireEvent.change(inputTime, {
      target: { value: "-1" },
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const errorMessage = screen.getByText('時間は0以上である必要があります');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test("削除できること", async () => {
    const records = await screen.findAllByTestId("record");
    const firstRecord = records[0];

    const deleteButton = within(firstRecord).getByTestId("delete-button");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockInitRecords.length).toBe(1);
    });
  });

  test("モーダルのタイトルが「記録編集」であること", async () => {
    const records = await screen.findAllByTestId("record");
    const firstRecord = records[0];

    const openEditModalButton = within(firstRecord).getByTestId("edit-button");
    fireEvent.click(openEditModalButton);
    const dialogTitle = await screen.findByRole("heading", {
      name: "記録編集",
    });
    expect(dialogTitle).toBeInTheDocument();
  });

  test("編集して登録すると更新されること", async () => {
    const records = await screen.findAllByTestId("record");
    const firstRecord = records[0];

    const openEditModalButton = within(firstRecord).getByTestId("edit-button");
    fireEvent.click(openEditModalButton);

    const editInputTitle = await screen.findByLabelText("学習内容");
    const editInputTime = await screen.findByLabelText("学習時間");
    const submitButton = await screen.findByRole("button", { name: "保存" });

    // テスト用の記録を入力して登録
    fireEvent.change(editInputTitle, {
      target: { value: "テスト編集" },
    });
    fireEvent.change(editInputTime, {
      target: { value: "2" },
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText("テスト編集")).toBeInTheDocument();
    });
  });
});
