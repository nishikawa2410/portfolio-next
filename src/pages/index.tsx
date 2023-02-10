import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";

type NavItem = {
  children?: Array<NavItem>;
  href?: string;
  label: string;
  subLabel?: string;
};

const NAV_ITEMS: Array<NavItem> = [
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/skills",
    label: "Skills",
  },
  {
    children: [
      {
        href: "#",
        label: "Work1",
      },
      {
        href: "#",
        label: "Work2",
      },
    ],
    label: "Works",
  },
  {
    children: [
      {
        href: "samples/financial_chart",
        label: "BitCoin Financial Chart",
      },
      {
        href: "#",
        label: "Sample2",
      },
    ],
    label: "Samples",
  },
];

export default function Home(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        align={"center"}
        bg={useColorModeValue("white", "gray.800")}
        borderBottom={1}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        borderStyle={"solid"}
        color={useColorModeValue("gray.600", "white")}
        minH={"100px"}
        px={{ base: 4 }}
        py={{ base: 2 }}
      >
        <Flex
          display={{ base: "flex", md: "none" }}
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
        >
          <IconButton
            aria-label={"Toggle Navigation"}
            icon={
              isOpen ? <CloseIcon h={3} w={3} /> : <HamburgerIcon h={5} w={5} />
            }
            onClick={onToggle}
            variant={"ghost"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Box textAlign={useBreakpointValue({ base: "center", md: "left" })} />
          <Flex display={{ base: "none", md: "flex" }}>
            <DesktopNav />
          </Flex>
        </Flex>
        <Stack
          direction={"row"}
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          spacing={6}
        ></Stack>
      </Flex>
      <Collapse animateOpacity={true} in={isOpen}>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = (): JSX.Element => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover placement={"bottom-start"} trigger={"hover"}>
            <PopoverTrigger>
              <Link href={navItem.href ?? "#"}>
                <Text
                  _hover={{
                    color: linkHoverColor,
                    textDecoration: "none",
                  }}
                  color={linkColor}
                  fontSize={"lg"}
                  fontWeight={500}
                  p={4}
                >
                  {navItem.label}
                </Text>
              </Link>
            </PopoverTrigger>
            {navItem.children && (
              <PopoverContent
                bg={popoverContentBgColor}
                border={0}
                boxShadow={"xl"}
                minW={"sm"}
                p={4}
                rounded={"xl"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};
const DesktopSubNav = ({ href, label, subLabel }: NavItem): JSX.Element => {
  return (
    <Link href={href ?? "#"} role={"group"}>
      <Stack
        _hover={{ bg: useColorModeValue("gray.50", "gray.900") }}
        align={"center"}
        direction={"row"}
        p={2}
        rounded={"md"}
      >
        <Box>
          <Text
            _groupHover={{ color: "gray.400" }}
            fontWeight={500}
            transition={"all .3s ease"}
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          align={"center"}
          flex={1}
          justify={"flex-end"}
          opacity={0}
          transform={"translateX(-10px)"}
          transition={"all .3s ease"}
        >
          <Icon as={ChevronRightIcon} color={"gray.400"} h={5} w={5} />
        </Flex>
      </Stack>
    </Link>
  );
};
const MobileNav = (): JSX.Element => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      display={{ md: "none" }}
      p={4}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};
const MobileNavItem = ({ children, href, label }: NavItem): JSX.Element => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack onClick={children && onToggle} spacing={4}>
      <Flex
        _hover={{
          textDecoration: "none",
        }}
        align={"center"}
        as={Link}
        href={href ?? "#"}
        justify={"space-between"}
        py={2}
      >
        <Text
          color={useColorModeValue("gray.600", "gray.200")}
          fontWeight={600}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            h={6}
            transform={isOpen ? "rotate(180deg)" : ""}
            transition={"all .25s ease-in-out"}
            w={6}
          />
        )}
      </Flex>
      <Collapse
        animateOpacity={true}
        in={isOpen}
        style={{ marginTop: "0!important" }}
      >
        <Stack
          align={"start"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          borderLeft={1}
          borderStyle={"solid"}
          mt={2}
          pl={4}
        >
          {children &&
            children.map((child) => (
              <Link href={child.href ?? "#"} key={child.label}>
                <Text py={2}>{child.label}</Text>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
