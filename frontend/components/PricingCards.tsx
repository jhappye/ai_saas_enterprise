const plans = [
  { name: 'Basic', price: '$49', code: 'basic', features: ['1 个知识库', '基础问答', '邮件支持'] },
  { name: 'Pro', price: '$199', code: 'pro', features: ['多知识库', '团队权限', '使用统计'] },
]

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <div className="card" key={plan.code}>
          <h3 className="text-2xl font-semibold">{plan.name}</h3>
          <p className="mt-2 text-4xl font-bold">{plan.price}<span className="text-base text-slate-400">/月</span></p>
          <ul className="mt-4 space-y-2 text-slate-300">{plan.features.map((f) => <li key={f}>• {f}</li>)}</ul>
          <a href="/signup" className="btn mt-6 w-full">选择 {plan.name}</a>
        </div>
      ))}
    </div>
  )
}
