import { Card, Toolbar, ToolbarProps } from "@fluentui/react-components";
import style from "./HeaderToolbar.module.css";

/**
 * A toolbar with some styles applied.
 * @param props The props to pass to the toolbar.
 */
export const HeaderToolbar = (props: ToolbarProps) => {
    return (
        <Card className={style.toolbar}>
            <Toolbar className={style.toolbarContainer} {...props}> {props.children} </Toolbar>
        </Card>
    );
};
