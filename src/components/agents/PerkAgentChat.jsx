import { useEffect, useState } from 'react';
import { LocateFixed, Loader2, SendHorizonal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PerkAgentMessageBubble from '@/components/agents/PerkAgentMessageBubble';

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 120000,
    });
  });
}

export default function PerkAgentChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('Coffee, dining, or wellness perks would be great.');
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('Use your phone location to get nearby perks.');
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversation?.id) return undefined;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data?.messages || []);
      const lastMessage = data?.messages?.[data.messages.length - 1];
      if (lastMessage?.role === 'assistant') setSending(false);
    });

    return unsubscribe;
  }, [conversation?.id]);

  const ensureConversation = async () => {
    if (conversation) return conversation;

    const created = await base44.agents.createConversation({
      agent_name: 'perk_finder',
      metadata: {
        name: 'Nearby Perk Finder',
        description: 'GPS-based perk recommendations',
      },
    });

    setConversation(created);
    return created;
  };

  const acquireLocation = async () => {
    if (coords) return coords;

    setLocating(true);
    try {
      const position = await getBrowserLocation();
      const nextCoords = {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      };

      setCoords(nextCoords);
      setStatus(`Location ready: ${nextCoords.latitude}, ${nextCoords.longitude}`);
      return nextCoords;
    } catch (error) {
      setStatus(error.message || 'Location access was blocked.');
      throw error;
    } finally {
      setLocating(false);
    }
  };

  const handleLocate = async () => {
    await acquireLocation();
  };

  const handleSend = async () => {
    setSending(true);
    const activeCoords = await acquireLocation();
    const activeConversation = await ensureConversation();

    const userMessage = [
      `My current location is latitude ${activeCoords.latitude} and longitude ${activeCoords.longitude}.`,
      'Please identify the most relevant perk opportunities near me right now.',
      prompt ? `My preferences: ${prompt}` : '',
      'Keep it focused on walkable options first.',
    ]
      .filter(Boolean)
      .join(' ');

    await base44.agents.addMessage(activeConversation, {
      role: 'user',
      content: userMessage,
    });

    setPrompt('');
  };

  return (
    <div className="rounded-[24px] bg-white/88 p-4 shadow-[0_18px_60px_rgba(17,31,61,0.08)] md:p-6">
      <div className="flex flex-col gap-3 border-b border-[#111f3d]/10 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#111f3d]/55">GPS perk agent</p>
          <h2 className="mt-1 text-[24px] font-canela text-[#111f3d]">Find perks near me</h2>
        </div>
        <Button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="bg-[#111f3d] text-white hover:bg-[#111f3d]/90"
        >
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
          {coords ? 'Refresh location' : 'Use my location'}
        </Button>
      </div>

      <p className="mt-3 text-sm text-[#111f3d]/70">{status}</p>

      <div className="mt-4 h-[340px] space-y-3 overflow-y-auto rounded-[20px] bg-[#f7f6f2] p-3 md:h-[420px]">
        {messages.length === 0 ? (
          <div className="rounded-[18px] bg-white px-4 py-3 text-sm text-[#111f3d]/72">
            Ask for the best nearby dining, wellness, coffee, fitness, or happy hour perks.
          </div>
        ) : (
          messages.map((message, index) => (
            <PerkAgentMessageBubble key={`${message.role}-${index}`} message={message} />
          ))
        )}

        {sending ? (
          <div className="flex items-center gap-2 rounded-[18px] bg-white px-4 py-3 text-sm text-[#111f3d]/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding the best nearby perks...
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="What kind of perks do you want right now?"
          className="min-h-[96px] border-[#111f3d]/10 bg-white"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={locating || sending}
          className="w-full bg-[#c5a15a] text-[#111f3d] hover:bg-[#c5a15a]/90"
        >
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizonal className="mr-2 h-4 w-4" />}
          Ask the perk agent
        </Button>
      </div>
    </div>
  );
}