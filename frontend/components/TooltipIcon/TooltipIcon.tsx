import { Slot, Tooltip, TooltipProps, useId } from '@fluentui/react-components';
import React, { useState } from 'react';

export declare type ToolTipIconProps = {
    /** The tooltip to show */
    tooltip: string | NonNullable<Slot<'div'>>;
    /** The icon to show, should be a fluent 9 icon satisfying the IconProps type */
    icon: JSX.Element;
    /** The class name to apply to the tooltip */
    className?: string;
};

/**
 * A tooltip with an icon that can be hovered over to show the tooltip.
 */
export const ToolTipIcon = (
    props: Partial<TooltipProps> & ToolTipIconProps
): JSX.Element | undefined => {
    const contentId = useId('content');
    const [visible, setVisible] = useState(false);

    if (!props.icon) {
        return undefined;
    }
    return (
        <span aria-owns={visible ? contentId : undefined} className={props.className}>
            <Tooltip
                content={
                    typeof props.tooltip === 'string'
                        ? {
                              children: props.tooltip,
                              id: contentId,
                          }
                        : props.tooltip
                }
                withArrow
                relationship="label"
                onVisibleChange={(e, data) => setVisible(data.visible)}
                {...props}
            >
                {React.cloneElement(props.icon, { tabIndex: 0 })}
            </Tooltip>
        </span>
    );
};
