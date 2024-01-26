import {
    Tooltip,
    TooltipProps,
    useId
} from "@fluentui/react-components";
import React, {useState} from "react";

export declare interface ToolTipIconProps {
    /** The tooltip to show */
    tooltip: string;
    /** The icon to show, should be a fluent 9 icon satisfying the IconProps interface */
    icon: JSX.Element;
    /** The class name to apply to the tooltip */
    className?: string;
}

/**
 * A tooltip with an icon that can be hovered over to show the tooltip.
 */
export const ToolTipIcon = (props: Partial<TooltipProps> & ToolTipIconProps): JSX.Element | undefined => {
    const contentId = useId("content");
    const [visible, setVisible] = useState(false);

    if (!props.icon) {
        return undefined;
    }
    return (
        <span aria-owns={visible ? contentId : undefined} className={props.className}>
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
