import { NextResponse } from 'next/server'
const translate = require('google-translate-api-x');

export async function POST(request: Request) {
  try {
    const { text, mode } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }
    
    // For full content translation, preserve markdown structure
    if (mode === 'content') {
      // Split by lines to preserve markdown headings
      const lines = text.split('\n')
      const translatedLines = await Promise.all(
        lines.map(async (line: string) => {
          if (!line.trim()) return line
          
          // Detect markdown headings
          const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
          if (headingMatch) {
            const [, hashes, headingText] = headingMatch
            try {
              const { text: translatedText } = await translate(headingText, { 
                from: 'en', 
                to: 'ja' 
              })
              return `${hashes} ${translatedText}`
            } catch (error) {
              console.error('Heading translation error:', error)
              return line
            }
          }
          
          // Detect code blocks and don't translate them
          if (line.startsWith('```')) {
            return line
          }
          
          // Detect lists
          const listMatch = line.match(/^(\s*[-*+]\s+)(.+)$/)
          if (listMatch) {
            const [, bullet, listText] = listMatch
            try {
              const { text: translatedText } = await translate(listText, { 
                from: 'en', 
                to: 'ja' 
              })
              return `${bullet}${translatedText}`
            } catch (error) {
              console.error('List translation error:', error)
              return line
            }
          }
          
          // Regular text
          try {
            const { text: translatedText } = await translate(line, { 
              from: 'en', 
              to: 'ja' 
            })
            return translatedText
          } catch (error) {
            console.error('Line translation error:', error)
            return line
          }
        })
      )
      
      return NextResponse.json({ translation: translatedLines.join('\n') })
    }
    
    // Simple translation for titles
    const { text: translatedText } = await translate(text, { 
      from: 'en', 
      to: 'ja' 
    })
    
    return NextResponse.json({ translation: translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { translation: Text, error: 'Translation failed, using original text' },
      { status: 200 }
    )
  }
}