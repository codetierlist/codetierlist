import { createDOMRenderer, renderToStyleElements } from '@fluentui/react-components';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        // 👇 creates a renderer that will be used for SSR
        const renderer = createDOMRenderer();
        const originalRenderPage = ctx.renderPage;

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: (App) =>
                    function EnhancedApp(props) {
                        const enhancedProps = {
                            ...props,
                            // 👇 this is required to provide a proper renderer instance
                            renderer,
                        };

                        return <App {...enhancedProps} />;
                    },
            });

        const initialProps = await Document.getInitialProps(ctx);
        const styles = renderToStyleElements(renderer);

        return {
            ...initialProps,
            styles: (
                <>
                    {initialProps.styles}
                    {/* 👇 adding Fluent UI styles elements to output */}
                    {styles}
                </>
            ),
        };
    }

    render() {
        return (
            <Html lang="en">
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
