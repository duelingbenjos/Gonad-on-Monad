import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WhitelistDialogProps {
  triggerVariant?: 'hero' | 'outline' | 'default';
  triggerText?: string;
}

const isEthLikeAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value.trim());

export const WhitelistDialog: React.FC<WhitelistDialogProps> = ({ triggerVariant = 'hero', triggerText = 'Join whitelist' }) => {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('gooch_whitelist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddress(parsed.address || '');
        setEmail(parsed.email || '');
      } catch {}
    }
  }, []);

  const addressValid = useMemo(() => isEthLikeAddress(address), [address]);
  const emailValid = useMemo(() => email === '' || /.+@.+\..+/.test(email), [email]);
  const formValid = addressValid && emailValid;

  const onSubmit = async () => {
    if (!formValid) return;
    setStatus('submitting');
    setMessage('');

    const payload = { address: address.trim(), email: email.trim() || undefined, ts: Date.now() };
    try {
      localStorage.setItem('gooch_whitelist', JSON.stringify(payload));
      // Stubbed POST – replace with real endpoint later
      await fetch('/api/whitelist', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }).catch(() => undefined);
      setStatus('success');
      setMessage('You\'re in. We\'ll ping you before mint.');
    } catch (e) {
      setStatus('error');
      setMessage('Something went limp. Try again.');
    }
  };

  const onCheck = async () => {
    setStatus('submitting');
    setMessage('');
    try {
      const saved = localStorage.getItem('gooch_whitelist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address?.toLowerCase() === address.trim().toLowerCase()) {
          setStatus('success');
          setMessage('Wallet found on local list. Server check coming soon.');
        } else {
          setStatus('error');
          setMessage('Not on local list. Try submitting.');
        }
      } else {
        setStatus('error');
        setMessage('No local entry found. Try submitting.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not check. Try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant as any}>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the whitelist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="0xYourWalletAddress" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input placeholder="email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={!formValid || status === 'submitting'} variant="hero">Submit</Button>
            <Button onClick={onCheck} disabled={!address} variant="outline">Check status</Button>
          </div>
          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>{message}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
