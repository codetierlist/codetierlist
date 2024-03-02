// allow markdown imports
declare module '*.md' {
    markdown
    export = markdown as string
}