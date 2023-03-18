#region Create ASG
resource "aws_autoscaling_group" "ec2_autoscaling_group" {
  name                      = "${local.prefix}-ASG"
  vpc_zone_identifier       = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
  max_size                  = 1
  min_size                  = 1
  desired_capacity          = 1
  launch_configuration      = aws_launch_configuration.asg_launch_configuration.name
  health_check_type         = "ELB"
  health_check_grace_period = 600
  default_cooldown          = 150
  force_delete              = true
  target_group_arns         = [aws_alb_target_group.server_backend_tg.arn] // Attach ASG to ALB target group
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "EC2-ASG-${terraform.workspace}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Type"
    value               = "Backend-${terraform.workspace}"
    propagate_at_launch = true
  }
}
#endregion

#region Create launch config
resource "aws_launch_configuration" "asg_launch_configuration" {
  name                        = "${local.prefix}-launch-config"
  image_id                    = data.aws_ami.ec2_ami.id
  instance_type               = var.ec2_instance_type
  key_name                    = var.default_keypair
  associate_public_ip_address = false
  iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name // ensure that any EC2 instances have permission to access AWS resource
  security_groups             = [aws_security_group.autoscaling_group_sg.id]
  user_data                   = filebase64("${path.module}/userdata/user-data.sh")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role_policy" "ec2_iam_role_policy" {
  name   = var.ec2_iam_role_policy_name
  role   = aws_iam_role.ec2_iam_role.id
  policy = <<EOF
{
  "Version" : "2012-10-17",
  "Statement" : [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*",
        "elasticloadbalancing:*",
        "cloudwatch:*",
        "logs:*",
        "autoscaling:*",
        "sns:Publish",
        "tag:GetResources"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = var.ec2_instance_profile_name
  role = aws_iam_role.ec2_iam_role.name
}

resource "aws_iam_role" "ec2_iam_role" {
  name = var.ec2_iam_role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["ec2.amazonaws.com", "application-autoscaling.amazonaws.com"]
        }
      }
    ]
  })
}
#endregion

#region Scale out policy
resource "aws_autoscaling_policy" "asg_scale_out_policy" {
  name                   = "ASG-SCALE-OUT-POLICY"
  autoscaling_group_name = aws_autoscaling_group.ec2_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = 1
  cooldown               = 150
  depends_on = [
    aws_autoscaling_group.ec2_autoscaling_group
  ]
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_out_alarm" {
  alarm_name          = "EC2-SCALE-OUT-ALARM"
  alarm_description   = "This metric monitors EC2 CPU utilization"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 50
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.asg_scale_out_policy.arn]
  depends_on = [
    aws_autoscaling_group.ec2_autoscaling_group
  ]
}
#endregion

#region Scale in policy
resource "aws_autoscaling_policy" "asg_scale_in_policy" {
  name                   = "ASG-SCALE-IN-POLICY"
  autoscaling_group_name = aws_autoscaling_group.ec2_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = -1
  cooldown               = 150
  depends_on = [
    aws_autoscaling_group.ec2_autoscaling_group
  ]
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_in_alarm" {
  alarm_name          = "EC2-SCALE-IN-ALARM"
  alarm_description   = "This metric monitors EC2 CPU utilization"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 10
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.asg_scale_in_policy.arn]
  depends_on = [
    aws_autoscaling_group.ec2_autoscaling_group
  ]
}
#endregion
