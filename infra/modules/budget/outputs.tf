output "budget_id" {
  value       = aws_budgets_budget.cost_budget.id
  description = "The ID of the AWS Budget"
}
