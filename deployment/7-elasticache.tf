
resource "aws_elasticache_cluster" "example" {
  cluster_id           = "funnychatapp-elasticache-cluster"
  engine               = "redis"
  engine_version       = "6.x"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.elasticache_subnet_group.name
  security_group_ids   = [aws_security_group.elasticache_sg.id]
}

resource "aws_elasticache_subnet_group" "elasticache_subnet_group" {
  name       = "${local.prefix}-subnet-elasticache-group"
  subnet_ids = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
}

