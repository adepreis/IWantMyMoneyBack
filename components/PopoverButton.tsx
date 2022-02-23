import { Popover, Text, Box } from "@mantine/core";
import React, { useState } from "react";
import { HiXCircle } from "react-icons/hi";

export function PopoverButton(props: React.PropsWithChildren<{label: string, disabled?: boolean}>) {
    const [opened, setOpened] = useState(false);
    const disabled = props?.disabled ?? false; 

    const children = React.Children.map(props.children, (child, childIndex) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                disabled: disabled
            });
        }
    });
    
    return <Popover
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        placement="center"
        withArrow
        noFocusTrap
        noEscape
        transition="pop-top-left"
        width={350}
        styles={{ body: { pointerEvents: 'none' } }}
        target={
            <div onMouseEnter={() => setOpened(disabled)} onMouseLeave={() => setOpened(false)}>
                {children}
            </div>
        }
    >
        <div style={{ display: 'flex' }}>
            <Text
                color={'red'}
                sx={{ display: 'flex', alignItems: 'center' }}
                mt={7}
                size="sm"
            >
                <HiXCircle style={{fontSize: "30"}} /> 
                <Box ml={10}>{props.label}</Box>
            </Text>
        </div>
    </Popover>
}