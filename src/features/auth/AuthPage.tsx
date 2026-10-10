import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { LuArrowLeft } from 'react-icons/lu'
import { ApiError } from '../../api'
import { signIn, signUp } from '../../auth'

type AuthField = 'name' | 'username' | 'email' | 'password' | 'password_confirmation' | 'phone'

const authFields: AuthField[] = ['name', 'username', 'email', 'password', 'password_confirmation', 'phone']

type AuthPageProps = {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({})

  function clearFieldError(field: AuthField) {
    setFormError(undefined)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = (field: AuthField) => String(formData.get(field) ?? '')

    setFormError(undefined)
    setFieldErrors({})

    if (!isLogin && value('password') !== value('password_confirmation')) {
      setFieldErrors({ password_confirmation: 'Passwords do not match.' })
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        await signIn({ email: value('email'), password: value('password') })
      } else {
        await signUp({
          name: value('name'),
          username: value('username'),
          email: value('email'),
          password: value('password'),
          password_confirmation: value('password_confirmation'),
          phone: value('phone'),
        })
      }

      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const nextFieldErrors: Partial<Record<AuthField, string>> = {}
        for (const field of authFields) {
          const message = error.getValidationMessages(field)[0]
          if (message) nextFieldErrors[field] = message
        }
        setFieldErrors(nextFieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function fieldFeedback(field: AuthField) {
    const message = fieldErrors[field]
    return message ? <p className="mb-0 text-[13px] text-red-800" id={`auth-${field}-error`}>{message}</p> : null
  }

  return (
    <main className="grid min-h-svh grid-cols-1 bg-bone text-ink min-[901px]:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex min-h-60 flex-col justify-between gap-10 bg-charcoal px-5 py-7 text-paper sm:min-h-67.5 sm:px-7 sm:py-9 min-[901px]:min-h-0 min-[901px]:px-9 min-[901px]:py-16">
        <div>
          <Link
            className="inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-spectral-citron underline-offset-4 hover:underline focus-visible:outline-spectral-citron"
            to="/"
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to storefront
          </Link>
          <h1 className="mb-0 mt-6 max-w-70 text-[34px] font-[560] leading-[1.04] sm:mt-6 min-[901px]:mt-12 min-[901px]:max-w-55 min-[901px]:text-[38px]">
            Your Shop account
          </h1>
          <p className="mb-0 mt-4 max-w-[28ch] text-[15px] text-[#d6d7ce]">
            Sign in or create an account to continue.
          </p>
        </div>
        <nav className="flex gap-4 min-[901px]:grid min-[901px]:gap-1" aria-label="Account navigation">
          <Link
            className="inline-flex min-h-11 items-center text-[13px] font-semibold text-paper underline-offset-[5px] hover:underline aria-[current=page]:text-spectral-citron focus-visible:outline-spectral-citron"
            aria-current={isLogin ? 'page' : undefined}
            to="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex min-h-11 items-center text-[13px] font-semibold text-paper underline-offset-[5px] hover:underline aria-[current=page]:text-spectral-citron focus-visible:outline-spectral-citron"
            aria-current={!isLogin ? 'page' : undefined}
            to="/register"
          >
            Create account
          </Link>
        </nav>
      </aside>

      <section className="grid min-w-0 place-items-center px-5 py-9 sm:px-7 sm:py-12 min-[901px]:px-12 min-[901px]:py-16" aria-labelledby="auth-title">
        <div className="w-full max-w-130">
          <h2 className="m-0 text-[30px] font-[560] leading-[1.15]" id="auth-title">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mb-7 mt-2.5 text-[15px] text-muted">
            {isLogin
              ? 'Sign in with the email address connected to your account.'
              : 'Enter your details to get started.'}
          </p>

          <form className="grid gap-4.5" onSubmit={submit}>
            {formError && <p className="m-0 text-[14px] text-red-800" role="alert">{formError}</p>}
            {!isLogin && (
              <>
                <div className="grid min-w-0 gap-1.75">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={50}
                    required
                    placeholder="Your name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
                    onChange={() => clearFieldError('name')}
                  />
                  {fieldFeedback('name')}
                </div>
                <div className="grid min-w-0 gap-1.75">
                  <label htmlFor="auth-username">Username</label>
                  <input
                    className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                    id="auth-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    minLength={3}
                    maxLength={50}
                    pattern="[A-Za-z0-9_-]+"
                    required
                    placeholder="Choose a username"
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby={fieldErrors.username ? 'auth-username-error' : undefined}
                    onChange={() => clearFieldError('username')}
                  />
                  {fieldFeedback('username')}
                </div>
              </>
            )}
            <div className="grid min-w-0 gap-1.75">
              <label htmlFor="auth-email">Email address</label>
              <input
                className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                required
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
                onChange={() => clearFieldError('email')}
              />
              {fieldFeedback('email')}
            </div>
            <div className="grid min-w-0 gap-1.75">
              <label htmlFor="auth-password">Password</label>
              <input
                className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={8}
                required
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                onChange={() => clearFieldError('password')}
              />
              {fieldFeedback('password')}
            </div>
            {!isLogin && (
              <>
                <div className="grid min-w-0 gap-1.75">
                  <label htmlFor="auth-password-confirmation">Confirm password</label>
                  <input
                    className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                    id="auth-password-confirmation"
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    placeholder="Confirm your password"
                    aria-invalid={Boolean(fieldErrors.password_confirmation)}
                    aria-describedby={fieldErrors.password_confirmation ? 'auth-password_confirmation-error' : undefined}
                    onChange={() => clearFieldError('password_confirmation')}
                  />
                  {fieldFeedback('password_confirmation')}
                </div>
                <div className="grid min-w-0 gap-1.75">
                  <label htmlFor="auth-phone">Phone number</label>
                  <input
                    className="min-h-12.5 w-full border border-rule-strong bg-paper px-3.5 text-ink placeholder:text-muted focus:border-marker-olive aria-[invalid=true]:border-red-800"
                    id="auth-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    required
                    placeholder="Your phone number"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'auth-phone-error' : undefined}
                    onChange={() => clearFieldError('phone')}
                  />
                  {fieldFeedback('phone')}
                </div>
              </>
            )}
            <button className="mt-1 min-h-12.5 w-full border-0 bg-charcoal font-semibold text-spectral-citron hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mb-0 mt-6 text-[15px] text-muted">
            {isLogin ? 'New to The Shop?' : 'Already have an account?'}{' '}
            <Link className="font-semibold text-ink underline decoration-marker-olive underline-offset-4" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
