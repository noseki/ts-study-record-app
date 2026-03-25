import { Box, Center, Container, Flex, HStack, Heading, IconButton, Spinner, Table, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { DeleteRecord, GetAllRecords, InsertRecord, UpdateRecord } from "./lib/record";
import { Record } from "./domain/record";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "./components/atoms/button/PrimaryButton";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { RecordModal } from "./components/organisms/record/RecordModal";

interface FormInputs {
  title: string;
  time: number;
}

export function StudyRecord() {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [totalTime, setTotalTime] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FormInputs>({
    mode: "onSubmit",
  });

  // supabaseから全記録を取得
  const getAllRecords = async () => {
    const recordsData = await GetAllRecords();
    setRecords(recordsData);
    setTotalTime(recordsData.reduce((accumulator, record) => accumulator + record.time, 0));
    setIsLoading(false);
  };

  useEffect(() => {
    getAllRecords();
  }, []);

  // 新規登録時のモーダル
  const onOpenAddModal = () => {
    reset(); // フォーム初期化
    setSelectedId(undefined);
    setOpen(true);
  };

  // 編集時のモーダル
  const onOpenEditModal = (id: string) => {
    const record = records.find((record) => record.id === id);
    if (!record) return;
    setSelectedId(record.id);
    setOpen(true);
    setValue("title", record.title);
    setValue("time", record.time);
  };

  const onSubmit = handleSubmit(async (formInputData) => {
    // if (!isValid) return;
    const newRecord = {
      id: selectedId ? selectedId : undefined,
      title: formInputData.title,
      time: formInputData.time,
    }
    if (selectedId) {
      // 編集処理
      await UpdateRecord(newRecord);
    } else {
      // 新規登録処理
      await InsertRecord(newRecord);
    }

    getAllRecords(); // 最新の記録を取得
    setSelectedId(undefined);
    reset();
    setOpen(false); // モーダルを閉じる
  });

  // 削除した後に最新の記録を取得
  const onDelete = async (id: string | undefined) => {
    if (!id) return;
    await DeleteRecord(id);
    getAllRecords();
  };

  return (
    <>
      <Flex bg="cyan.500" color="gray.50" align="center" justify="space-between" padding={{ base: 3, md: 5 }}>
          <Heading as="h1" fontSize={{ base: 'md', md: 'lg' }}>
              学習記録アプリ
          </Heading>
          <PrimaryButton onClick={onOpenAddModal}>新規登録</PrimaryButton>
      </Flex>

      {isLoading ? (
        <Center h="80vh">
          <VStack colorPalette="teal">
            <Spinner color="colorPalette.600" />
            <Text color="colorPalette.600">Loading...</Text>
          </VStack>
        </Center>
      ) : (
      <Container>
        <Table.Root size={{ md: 'md', base: 'sm' }} variant="line" my={{ md: 10, base: 5 }} interactive>
          <Table.Caption />
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader textAlign={"center"}>学習内容</Table.ColumnHeader>
              <Table.ColumnHeader textAlign={"center"}>学習時間</Table.ColumnHeader>
              <Table.ColumnHeader textAlign={"center"}>操作</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body data-testid="tbody">
            {records.map((record) => (
                <Table.Row key={record.id} data-testid="record">
                  <Table.Cell textAlign={"center"}>{record.title}</Table.Cell>
                  <Table.Cell textAlign={"center"}>{`${record.time}時間`}</Table.Cell>
                  <Table.Cell textAlign={"center"}>
                    <HStack gapX={2} justify={"center"}>
                      <IconButton
                        data-testid="edit-button"
                        aria-label="記録編集"
                        variant={"ghost"}
                        size="sm"
                        onClick={() => {
                          if (record.id) {
                            onOpenEditModal(record.id);
                          }
                        }}
                      >
                        <FaRegEdit />
                      </IconButton>
                      <IconButton
                        data-testid="delete-button"
                        aria-label="記録削除"
                        variant={"ghost"}
                        size="sm"
                        color="red.500"
                        onClick={() => onDelete(record.id)}
                      >
                        <FaRegTrashAlt />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <Box>合計時間：{totalTime} / 1000 (h)</Box>
      </Container>
      )}

      <RecordModal
        selectedId={selectedId}
        open={open}
        setOpen={setOpen}
        onSubmit={onSubmit}
        errors={errors}
        register={register}
      />
    </>
  );
}
