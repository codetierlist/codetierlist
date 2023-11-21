import { Toolbar, ToolbarProps } from "@fluentui/react-components";
import style from "./HeaderToolbar.module.css";

/**
 * A toolbar with some styles applied.
 * @param props The props to pass to the toolbar.
 */
export const HeaderToolbar = (props: ToolbarProps) => {
    return (
        <Toolbar {...props} className={style.toolbar}> {props.children} </Toolbar>
    );
};
