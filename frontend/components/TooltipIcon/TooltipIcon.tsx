import {
    Tooltip,
    TooltipProps,
    useId
} from "@fluentui/react-components";
import React, {useState} from "react";

/**
 * A tooltip with an icon that can be hovered over to show the tooltip.
 * @param props tooltip string, icon
 * @property tooltip the tooltip to show
 * @property icon the icon to show, should be a fluent 9 icon satisfying the IconProps interface
 */
export const ToolTipIcon = (props: Partial<TooltipProps> & {tooltip: string, icon?: JSX.Element, className?: string}) => {
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
