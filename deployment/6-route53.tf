# Get already created hosted zone
data "aws_route53_zone" "main" {
  name         = var.main_api_server_domain
  private_zone = false
}

#region Create Route53 cert for ALB to listen HTTPS traffic
resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.dev_cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation_record.fqdn]
}

resource "aws_acm_certificate" "dev_cert" {
  domain_name       = var.dev_api_server_domain
  validation_method = "DNS"

  tags = {
    "Name"      = local.prefix
    Environment = terraform.workspace
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation_record" {
  allow_overwrite = false
  ttl             = 60
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = tolist(aws_acm_certificate.dev_cert.domain_validation_options)[0].resource_record_name
  records         = [tolist(aws_acm_certificate.dev_cert.domain_validation_options)[0].resource_record_value]
  type            = tolist(aws_acm_certificate.dev_cert.domain_validation_options)[0].resource_record_type
}
#endregion

#region Create Route53 DNS record to map ALB to Dev domain
resource "aws_route53_record" "alb_dns_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.dev_api_server_domain
  type    = "A"

  alias {
    name                   = aws_alb.application_load_balancer.dns_name
    zone_id                = aws_alb.application_load_balancer.zone_id
    evaluate_target_health = false
  }

  depends_on = [
    aws_alb.application_load_balancer
  ]
}

#endregion
