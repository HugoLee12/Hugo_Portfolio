import React, { useState } from 'react';
import { motion } from 'motion/react';
import { profile } from '../data/profile';
import { validateContactPayload } from '../lib/contactValidation';

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export function ContactSection() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
      website: String(formData.get('website') || ''),
    };

    const validation = validateContactPayload(payload);
    if (validation.ok === false) {
      setSubmitState('error');
      setStatusMessage(validation.error);
      return;
    }

    setSubmitState('sending');
    setStatusMessage('Transmitting message...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Message could not be sent.');
      }

      form.reset();
      setSubmitState('sent');
      setStatusMessage('Message sent. I will reply as soon as possible.');
    } catch (error) {
      setSubmitState('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Message could not be sent.',
      );
    }
  };

  const buttonLabel =
    submitState === 'sending'
      ? 'Transmitting...'
      : submitState === 'sent'
        ? 'Message Sent'
        : submitState === 'error'
          ? 'Retry Transmission'
          : 'Transmit Message';

  return (
    <section id="contact" className="w-full py-24 md:py-32 relative flex items-center justify-center min-h-[80vh]">
      {/* Background Flare specific to Contact without bounds clipping */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Left Col - Cinematic Typography */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex flex-col justify-center"
          >
             <div className="text-[10px] text-slate-300/70 font-mono tracking-[0.3em] font-medium uppercase mb-4 pl-1 flex items-center">
               <span className="inline-block w-2 h-2 rounded-full bg-slate-300/50 mr-3 animate-pulse" />
               Secure Visual Link
             </div>
             <h2 className="text-5xl md:text-7xl font-sans font-light tracking-tighter text-white leading-tight">
                TRANSMIT<br/>
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  MESSAGE
                </span>
             </h2>
             <p className="mt-8 text-slate-400 font-mono text-sm max-w-sm tracking-wide leading-relaxed">
               Send a direct transmission from this portfolio. Your message is delivered through the site contact channel.
             </p>
          </motion.div>

          {/* Right Col - Deep Space Glassmorphism Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
             {/* Coordinate accents */}
             <div className="absolute -top-6 -left-2 text-[10px] font-mono text-slate-500/50 tracking-widest">[X: 194.22 // Y: 091.00]</div>
             <div className="absolute -bottom-6 -right-2 text-[10px] font-mono text-slate-500/50 tracking-widest">[STATUS: AWAITING_INPUT]</div>

             <div className="p-8 md:p-10 relative">
                {/* Thin glass edges highlights */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />

                <form className="space-y-12 block" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <div className="relative group">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      maxLength={80}
                      className="peer w-full bg-transparent border-b border-white/10 py-2 text-sm text-white font-mono placeholder-transparent focus:outline-none focus:border-transparent transition-colors"
                      placeholder="Name"
                    />
                    <label htmlFor="name" className="absolute left-0 -top-5 text-[10px] text-slate-500 font-mono tracking-widest uppercase transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-slate-600 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-white/80 pointer-events-none">
                      Operator Name
                    </label>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/80 scale-x-0 peer-focus:scale-x-100 transition-transform origin-left duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none" />
                  </div>

                  <div className="relative group">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      maxLength={160}
                      className="peer w-full bg-transparent border-b border-white/10 py-2 text-sm text-white font-mono placeholder-transparent focus:outline-none focus:border-transparent transition-colors"
                      placeholder="Email"
                    />
                    <label htmlFor="email" className="absolute left-0 -top-5 text-[10px] text-slate-500 font-mono tracking-widest uppercase transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-slate-600 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-white/80 pointer-events-none">
                      Return Frequency (Email)
                    </label>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/80 scale-x-0 peer-focus:scale-x-100 transition-transform origin-left duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none" />
                  </div>

                  <div className="relative group">
                    <textarea
                      id="message"
                      name="message"
                      rows={1}
                      required
                      minLength={10}
                      maxLength={2000}
                      className="peer w-full bg-transparent border-b border-white/10 py-2 text-sm text-white font-mono placeholder-transparent focus:outline-none focus:border-transparent transition-colors resize-none min-h-[36px] overflow-hidden"
                      placeholder="Message"
                    />
                    <label htmlFor="message" className="absolute left-0 -top-5 text-[10px] text-slate-500 font-mono tracking-widest uppercase transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-slate-600 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-white/80 pointer-events-none">
                      Transmission Payload
                    </label>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/80 scale-x-0 peer-focus:scale-x-100 transition-transform origin-left duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none" />
                  </div>

                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={submitState === 'sending'}
                      className="relative w-full overflow-hidden border border-white/10 bg-transparent py-4 text-xs font-mono tracking-[0.2em] uppercase text-white transition-all duration-700 hover:bg-white/5 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      {/* Sweeping light effect on hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-center gap-3">
                         {submitState === 'sending' ? (
                           <>
                             <span className="flex space-x-1">
                               <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                               <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                               <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                             </span>
                             <span className="text-white">{buttonLabel}</span>
                           </>
                         ) : (
                           <span>{buttonLabel}</span>
                         )}
                      </div>
                    </button>
                    <div className="mt-4 text-center" aria-live="polite">
                      <span className={`text-[9px] font-mono tracking-widest uppercase ${
                        submitState === 'error'
                          ? 'text-rose-300'
                          : submitState === 'sent'
                            ? 'text-emerald-300'
                            : 'text-slate-600'
                      }`}>
                        {statusMessage || `DESTINATION: ${profile.contact.email} // SECURE SERVER RELAY`}
                      </span>
                    </div>
                  </div>
                </form>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
