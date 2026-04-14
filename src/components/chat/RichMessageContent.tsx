import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)

type RichMessageContentProps = {
  content: string
}

export default function RichMessageContent({ content }: RichMessageContentProps) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? '')
          const code = String(children).replace(/\n$/, '')

          if (!match) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          const language = match[1]
          const highlighted = hljs.getLanguage(language)
            ? hljs.highlight(code, { language }).value
            : hljs.highlightAuto(code).value

          return (
            <code
              {...props}
              className={`hljs language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
