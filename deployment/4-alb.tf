#region Create ALB
resource "aws_alb" "application_load_balancer" {
  name                       = "${local.prefix}-alb"
  load_balancer_type         = "application"
  internal                   = false
  subnets                    = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
  security_groups            = [aws_security_group.alb_sg.id]
  enable_deletion_protection = false
  ip_address_type            = "ipv4"
  idle_timeout               = 300

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-ALB" })
  )
}
#endregion

#region Create ALB listener
resource "aws_alb_listener" "alb_https_listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = var.https_ssl_policy
  certificate_arn   = aws_acm_certificate_validation.cert_validation.certificate_arn

  depends_on = [
    aws_acm_certificate_validation.cert_validation
  ]

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.server_backend_tg.arn
  }
}

resource "aws_alb_listener" "alb_http_listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

#endregion

#region Create ALB target group
resource "aws_alb_target_group" "server_backend_tg" {
  name                 = "${local.prefix}-tg"
  vpc_id               = aws_vpc.main.id
  port                 = var.default_api_port
  protocol             = "HTTP"
  deregistration_delay = 60

  health_check {
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 120
    timeout             = 100
    matcher             = "200"
  }

  stickiness {
    type        = "app_cookie"
    cookie_name = "session"
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-tg" })
  )
}
#endregion
