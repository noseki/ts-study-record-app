import React, { memo } from 'react';
import { Button, Flex, Input, Stack, Text } from '@chakra-ui/react';
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { PrimaryButton } from '@/components/atoms/button/PrimaryButton';
import { type FieldErrors, type UseFormRegister } from "react-hook-form";


interface FormInputs {
    title: string;
    time: number;
}

type Props = {
    selectedId?: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSubmit: (e?: React.BaseSyntheticEvent | undefined) => Promise<void>;
    errors: FieldErrors<FormInputs>;
    register: UseFormRegister<FormInputs>;
};

export const RecordModal: React.FC<Props> = memo((props) => {
    const { selectedId, open, setOpen, onSubmit, errors, register } = props;

    return (
        <DialogRoot
            lazyMount
            open={open}
            onOpenChange={(e) => setOpen(e.open)}
            motionPreset="slide-in-bottom"
            trapFocus={false}
        >
            <DialogContent pb={2}>
                <DialogHeader>
                    <DialogTitle>{selectedId ? '記録編集' : '新規登録'}</DialogTitle>
                </DialogHeader>
                <DialogBody mx={4}>
                    <Stack gap={4}>
                        <Field label="学習内容">
                            <Input
                                placeholder="(例)Reactの学習"
                                {...register("title", {
                                    required: "内容の入力は必須です",
                                })}
                            />
                            <Text color="red">{errors.title?.message}</Text>
                        </Field>

                        <Field label="学習時間">
                            <Flex align="center" w="100%" gap={2}>
                                <Input
                                    type="number"
                                    min={0}
                                    w={"90%"}
                                    placeholder="0"
                                    {...register("time", {
                                        required: "時間の入力は必須です",
                                        min: {
                                            value: 0,
                                            message: "時間は0以上である必要があります",
                                        },
                                    })}
                                />
                                <Text>時間</Text>
                            </Flex>
                            <Text color="red">{errors.time?.message}</Text>
                        </Field>
                    </Stack>
                </DialogBody>
                <DialogFooter mb="2">
                    <DialogActionTrigger asChild>
                        <Button variant="outline" aria-label="Cancel">キャンセル</Button>
                    </DialogActionTrigger>
                    <PrimaryButton onClick={onSubmit} aria-label="Submit">
                        {selectedId ? '保存' : '登録'}
                    </PrimaryButton>
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    );
});
