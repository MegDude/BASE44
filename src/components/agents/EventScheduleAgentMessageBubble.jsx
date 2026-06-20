import ReactMarkdown from 'react-markdown';

export default function EventScheduleAgentMessageBubble({ message }) {
  const isUser = message?.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser ? 'bg-[#111f3d] text-white' : 'bg-white text-[#111f3d]'
        }`}
      >
        {isUser ? (
          <p>{message?.content}</p>
        ) : (
          <ReactMarkdown className="prose prose-sm max-w-none text-inherit [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message?.content || ''}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}