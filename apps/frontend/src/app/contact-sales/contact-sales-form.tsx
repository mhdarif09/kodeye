'use client';

import { type FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  MessageSquareText,
  Send,
  Sparkles,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { MarketingNav } from '../../components/marketing-nav';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { salesApi } from '../../features/sales/api';
import { getErrorMessage } from '../../lib/utils';
import { whatsappUrl } from '../../lib/whatsapp';
import { services } from '../services/service-data';

const serviceOptions = [
  { label: 'Audit Platform', value: 'audit-platform' },
  ...services.map((service) => ({
    label: service.title,
    value: service.slug,
  })),
  { label: 'Not sure yet', value: 'not-sure' },
];

const budgetOptions = [
  'Still exploring',
  'Under IDR 25M',
  'IDR 25M - 75M',
  'IDR 75M - 150M',
  'IDR 150M+',
];

const timelineOptions = [
  'As soon as possible',
  'This month',
  'This quarter',
  'Planning for later',
];

export function ContactSalesForm() {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get('service') ?? '';
  const defaultService = useMemo(
    () =>
      serviceOptions.some((option) => option.value === selectedService)
        ? selectedService
        : 'not-sure',
    [selectedService],
  );
  const [form, setForm] = useState({
    budget: 'Still exploring',
    companyName: '',
    email: '',
    message: '',
    name: '',
    phone: '',
    service: defaultService,
    timeline: 'This month',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const whatsappHref = whatsappUrl(
    'Halo Kodeye, saya ingin konsultasi tentang kebutuhan sistem digital. Saya sedang membuka halaman contact sales dan ingin diskusi via WhatsApp.',
  );

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess(false);
    try {
      await salesApi.createInquiry({ ...form, source: 'contact-sales-page' });
      setSuccess(true);
      setForm((current) => ({
        ...current,
        companyName: '',
        email: '',
        message: '',
        name: '',
        phone: '',
      }));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <MarketingNav />
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              <MessageSquareText className="h-4 w-4 text-brand-600" />
              Contact sales
            </p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
              Tell us what you want Kodeye to improve.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Share your codebase, automation, infrastructure, or website goals.
              Your message goes into the admin sales inbox so the team can
              qualify and follow up properly.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                'We review the scope and recommend the best next step.',
                'You can ask for platform access, service delivery, or both.',
                'No GitHub install is required just to talk to sales.',
              ].map((item) => (
                <p
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                  key={item}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <form
            className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-6"
            onSubmit={(event) => void submit(event)}
          >
            <div className="mb-6 rounded-2xl border border-slate-200 bg-[#f7f5ef] p-3 sm:p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                <a
                  className="group rounded-2xl bg-slate-950 p-5 text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                  href={whatsappHref}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight">
                    Chat WhatsApp
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Konsultasi cepat dengan pesan otomatis yang sudah terisi.
                  </p>
                </a>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Send className="h-5 w-5" />
                    </div>
                    <Sparkles className="h-5 w-5 text-brand-500" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight">
                    Kirim Form Brief
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Isi detail project agar kebutuhan bisa ditinjau lebih rapi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="sales-name"
                label="Your name"
                onChange={(event) => update('name', event.target.value)}
                required
                value={form.name}
              />
              <Input
                id="sales-email"
                label="Work email"
                onChange={(event) => update('email', event.target.value)}
                required
                type="email"
                value={form.email}
              />
              <Input
                id="sales-company"
                label="Company"
                onChange={(event) => update('companyName', event.target.value)}
                required
                value={form.companyName}
              />
              <Input
                id="sales-phone"
                label="Phone or WhatsApp"
                onChange={(event) => update('phone', event.target.value)}
                value={form.phone}
              />
              <Select
                id="sales-service"
                label="What do you need?"
                onChange={(event) => update('service', event.target.value)}
                value={form.service}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                id="sales-budget"
                label="Budget range"
                onChange={(event) => update('budget', event.target.value)}
                value={form.budget}
              >
                {budgetOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
              <Select
                id="sales-timeline"
                label="Timeline"
                onChange={(event) => update('timeline', event.target.value)}
                value={form.timeline}
              >
                {timelineOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>

            <label className="mt-4 block space-y-2" htmlFor="sales-message">
              <span className="text-sm font-medium text-slate-700">
                Project context
              </span>
              <textarea
                className="min-h-36 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                id="sales-message"
                minLength={20}
                onChange={(event) => update('message', event.target.value)}
                placeholder="Tell us about the current problem, systems involved, business goal, and deadline."
                required
                value={form.message}
              />
            </label>

            <div className="mt-5 grid gap-3">
              {success ? (
                <Alert tone="success">
                  Message received. The Kodeye team can now see it in the admin
                  sales inbox.
                </Alert>
              ) : null}
              {error ? <Alert tone="error">{error}</Alert> : null}
            </div>

            <Button className="mt-5 w-full" disabled={busy} type="submit">
              {busy ? 'Sending...' : 'Send to sales team'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
