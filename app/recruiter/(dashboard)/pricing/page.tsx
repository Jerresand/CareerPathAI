import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { checkoutAction } from '@/lib/payments/actions';

export default async function PricingPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id);
  const products = await getStripeProducts();
  const prices = await getStripePrices();

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for small teams just getting started',
      price: '49',
      interval: 'month',
      features: [
        'Up to 100 talent profiles',
        'Basic talent filtering',
        'Standard job listings',
        '5 active job posts',
        'Email support'
      ],
      priceId: prices[0]?.id
    },
    {
      name: 'Pro',
      description: 'For growing teams with advanced needs',
      price: '99',
      interval: 'month',
      features: [
        'Up to 500 talent profiles',
        'Advanced talent filtering',
        'Premium job listings',
        '15 active job posts',
        'Priority support',
        'Analytics dashboard',
        'Team collaboration tools'
      ],
      priceId: prices[1]?.id,
      popular: true
    }
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">
            Select the perfect plan for your recruitment needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-2 border-orange-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <form action={checkoutAction} className="w-full">
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <Button
                    type="submit"
                    className={`w-full ${
                      plan.popular
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    disabled={!plan.priceId || teamData?.planName === plan.name}
                  >
                    {teamData?.planName === plan.name
                      ? 'Current Plan'
                      : 'Upgrade Now'}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 