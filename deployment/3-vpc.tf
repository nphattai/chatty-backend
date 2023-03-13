# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr_block

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}" })
  )
}

# Create 2 public subnets
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.vpc_public_subnets[0]
  availability_zone       = var.vpc_availability_zones[0]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-public-1a" })
  )
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.vpc_public_subnets[1]
  availability_zone       = var.vpc_availability_zones[1]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-public-1b" })
  )
}

# Create 2 private subnets
resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.vpc_private_subnets[0]
  availability_zone = var.vpc_availability_zones[0]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-1a" })
  )
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.vpc_private_subnets[1]
  availability_zone = var.vpc_availability_zones[1]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-1b" })
  )
}

# Create internet gateway
resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-igw" })
  )
}

# Create public route table
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-public-RT" })
  )
}

resource "aws_route" "public_igw_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = var.global_destination_cidr_block
  gateway_id             = aws_internet_gateway.main_igw.id
  depends_on = [
    aws_route_table.public_route_table
  ]
}

resource "aws_route_table_association" "public_subnet_1_association" {
  route_table_id = aws_route_table.public_route_table.id
  subnet_id      = aws_subnet.public_subnet_a.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  route_table_id = aws_route_table.public_route_table.id
  subnet_id      = aws_subnet.public_subnet_b.id
}

# Create nat gateway
resource "aws_eip" "elastic_ip" {
  depends_on = [
    aws_internet_gateway.main_igw
  ]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-eip" })
  )
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.elastic_ip.id
  subnet_id     = aws_subnet.public_subnet_a.id

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-nat-gw" })
  )
}

# Create private route table
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-RT" })
  )
}

resource "aws_route" "private_nat_gw_route" {
  route_table_id         = aws_route_table.private_route_table.id
  destination_cidr_block = var.global_destination_cidr_block
  nat_gateway_id         = aws_nat_gateway.nat_gateway.id
}

resource "aws_route_table_association" "private_subnet_1_association" {
  subnet_id      = aws_subnet.private_subnet_a.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_subnet_2_association" {
  subnet_id      = aws_subnet.private_subnet_b.id
  route_table_id = aws_route_table.private_route_table.id
}
