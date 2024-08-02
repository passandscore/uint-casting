import React, { useState } from "react";
import { Container, Flex, Text, Input, useToast, Switch, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const MAX_BYTES = 32;
const MIN_BYTES = 1; // Corresponds to uint8

const UintCaster = () => {
  const [uintValue, setUintValue] = useState("");
  const [castedValues, setCastedValues] = useState<{ hex: string; decimal: string; maxDecimal: string; isOverflow: boolean }[]>([]);
  const [showDecimal, setShowDecimal] = useState(false);
  const [showMaxDecimal, setShowMaxDecimal] = useState(false);
  const toast = useToast();

  const handleOnChange = (value: string) => {
    if (value === null || value.trim() === "") {
      setUintValue("");
      setCastedValues([]);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast({
        title: "Invalid input.",
        description: "Please enter a valid positive integer.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setUintValue(value);
    updateCasting(value);
  };

  const updateCasting = (value: string) => {
    try {
      const bigNumberValue = BigInt(value);
      const results = [] as { hex: string; decimal: string; maxDecimal: string; isOverflow: boolean }[];

      for (let bytes = MIN_BYTES; bytes <= MAX_BYTES; bytes++) {
        const maxValue = BigInt(2 ** (bytes * 8) - 1);
        const maxDecimal = maxValue.toString();

        const trimmedValue = bigNumberValue.toString().slice(-maxValue.toString().split("").length);
        const truncatedValue = +bigNumberValue.toString() > +maxDecimal ? +trimmedValue : +bigNumberValue.toString();

        const hexString = truncatedValue.toString(16);
        const paddedHexString = hexString.padStart(bytes * 2, "0");
        const truncatedHexString = paddedHexString.slice(-bytes * 2);

        const isOverflow = truncatedValue > maxValue;

        const decimalValue = truncatedValue.toString();

        results.push({
          hex: `0x${truncatedHexString}`,
          decimal: decimalValue,
          maxDecimal: maxDecimal,
          isOverflow,
        });
      }

      setCastedValues(results);
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Container maxW="container.lg" mt="2rem" position="relative">
      <Flex direction="column" align="center" position="sticky" top="0" zIndex="1"  >
        <Input
          type="text"
          value={uintValue}
          onChange={(e) => handleOnChange(e.target.value)}
          placeholder="Enter a uint value"
          mb="1rem"
        />
        {uintValue && (
          <>
            <Flex alignItems="center" mb="1rem">
              <Text mr="1rem">Show Decimal:</Text>
              <Switch
                isChecked={showDecimal}
                onChange={(e) => setShowDecimal(e.target.checked)}
              />
              <Text mr="1rem" ml="2rem">Show Max Decimal:</Text>
              <Switch
                isChecked={showMaxDecimal}
                onChange={(e) => setShowMaxDecimal(e.target.checked)}
              />
            </Flex>
          </>
        )}
      </Flex>
      <Flex
        direction="column"
        align="center"
        mt="1rem"
        overflowY="auto"
        maxHeight="calc(100vh - 10rem)" // Adjust as needed to fit your layout
        p="1rem"
        // borderWidth="1px"
        // borderColor="gray.200"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textAlign="right">Uint Type</Th>
              <Th>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {castedValues.map((value, index) => (
              <Tr key={index} color={value.isOverflow ? "red.500" : "inherit"}>
                <Td textAlign="right">{`uint${(index + 1) * 8}`}</Td>
                <Td>
                  {showMaxDecimal
                    ? value.maxDecimal
                    : showDecimal
                    ? value.decimal
                    : value.hex}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Flex>
    </Container>
  );
};

export default UintCaster;
