import {
    Tooltip,
    TooltipProps,
    useId
} from "@fluentui/react-components";
import React, {useState} from "react";

/**
 * Add a tooltip to an icon
 * @param props tooltip string, icon
 */
export const ToolTipIcon = (props: Partial<TooltipProps> & {tooltip: string, icon?: JSX.Element}) => {
    const contentId = useId("content");
    const [visible, setVisible] = useState(false);
    if(!props.icon) {
        return undefined;
    }
    return (
        <span aria-owns={visible ? contentId : undefined}>
            <Tooltip
                content={{
                    children: props.tooltip,
                    id: contentId,
                }}
                withArrow
                relationship="label"
                onVisibleChange={(e, data) => setVisible(data.visible)}
                {...props}
            >
                {React.cloneElement(props.icon, {tabIndex:0})}
            </Tooltip>
        </span>
    );
};