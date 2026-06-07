resource "aws_budgets_budget" "cost_budget" {
  name              = "${var.project_name}-${var.environment}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = var.limit_amount
  limit_unit        = "USD"
  time_period_start = "2026-01-01_00:00" # Arbitrary starting date, standard format
  time_unit         = "MONTHLY"

  # Alert 1: Actual Cost > 80% ($12)
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_email]
  }

  # Alert 2: Forecasted Cost > 100% ($15)
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_email]
  }
}
