import { Button } from '@chakra-ui/react';
import React, { memo } from 'react';

type Props = {
    children: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
};

export const PrimaryButton: React.FC<Props> = memo((props) => {
    const { children, disabled = false, loading = false, onClick } = props;

    return (
        <Button
            bg="blue.500"
            color="white"
            _hover={{ opacity: 0.8 }}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
        >
            {children}
        </Button>
    );
});
