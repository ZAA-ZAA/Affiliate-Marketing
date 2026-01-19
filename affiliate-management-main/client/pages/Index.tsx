import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Link as LinkIcon,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  MousePointer,
  Award,
  UserPlus,
  Eye,
  Calendar,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Partner Manager
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Internal Business Tool
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Affiliate Partner
            <span className="block">Management Hub</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your centralized dashboard to register affiliate partners, create
            trackable links, and monitor performance metrics for commission
            calculations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
              >
                Admin Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/affiliate/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-2"
              >
                Partner Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">New affiliate partner?</p>
            <Link
              to="/affiliate/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up as affiliate partner →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Partner Management
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
              Performance Tracking
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-purple-500" />
              Commission Calculation
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Everything you need to manage your affiliates
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your affiliate program with powerful tools for partner
            management and performance tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: UserPlus,
              title: "Partner Registration",
              description:
                "Easily register new affiliate partners with custom commission rates and tracking codes.",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: LinkIcon,
              title: "Link Generation",
              description:
                "Create trackable affiliate links for each partner with unique identifiers.",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: BarChart3,
              title: "Performance Analytics",
              description:
                "Monitor clicks, conversions, and earnings with detailed performance metrics.",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: DollarSign,
              title: "Commission Tracking",
              description:
                "Automated commission calculations based on partner performance and rates.",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: TrendingUp,
              title: "Growth Insights",
              description:
                "Identify top-performing partners and optimize your affiliate strategy.",
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: Award,
              title: "Partner Rankings",
              description:
                "Rank partners by performance to reward your top affiliates.",
              color: "from-red-500 to-pink-500",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Your Partner Management Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive view of your affiliate program with real-time
            data and insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Users,
              title: "Active Partners",
              value: "24",
              change: "+3 this month",
              color: "text-blue-600",
            },
            {
              icon: MousePointer,
              title: "Total Clicks",
              value: "15,847",
              change: "+12% vs last month",
              color: "text-green-600",
            },
            {
              icon: DollarSign,
              title: "Commissions Owed",
              value: "$3,247",
              change: "Ready for payout",
              color: "text-purple-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white/80 backdrop-blur"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Recent Partner Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Sarah Johnson",
                  action: "Generated 47 clicks",
                  time: "2 hours ago",
                  earnings: "$127.50",
                },
                {
                  name: "Mike Chen",
                  action: "New conversion recorded",
                  time: "4 hours ago",
                  earnings: "$89.00",
                },
                {
                  name: "Lisa Rodriguez",
                  action: "Generated 23 clicks",
                  time: "6 hours ago",
                  earnings: "$45.75",
                },
                {
                  name: "David Kim",
                  action: "Generated 31 clicks",
                  time: "8 hours ago",
                  earnings: "$67.25",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {activity.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {activity.earnings}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to manage your affiliate partners?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Access your dashboard to register new partners, track performance,
              and manage commissions all in one place.
            </p>
            <Link to="/affiliate/login">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Partner Manager
            </span>
          </div>
          <p className="text-gray-600">
            Your internal affiliate partner management solution.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Admin Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/affiliate/login"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Partner Login
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            &copy; 2024 Partner Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
