# resource "aws_instance" "private_instance_a" {
#   ami                         = data.aws_ami.ec2_ami.id
#   instance_type               = var.ec2_instance_type
#   vpc_security_group_ids      = [aws_security_group.private_instance_sg.id]
#   subnet_id                   = aws_subnet.private_subnet_a.id
#   key_name                    = var.default_keypair
#   associate_public_ip_address = true
#   tags = merge(
#     local.common_tags,
#     tomap({ "Name" = "${local.prefix}-private-instance-a" })
#   )
# }
