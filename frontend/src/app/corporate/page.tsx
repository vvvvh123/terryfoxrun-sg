"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import { CorporatePackage, EventDto, createCorporateOrder, getCorporatePackages, getCurrentEvent } from "@/lib/api";

type ShirtType = "adult" | "kid";

type AllocationRow = {
  id: string;
  type: ShirtType;
  size: string;
  quantity: number;
};

function normalizeShirtType(type?: string): ShirtType {
  return type?.toLowerCase() === "kid" ? "kid" : "adult";
}

function createAllocationRow(type: ShirtType, size: string): AllocationRow {
  return {
    id: `${type}-${size}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    size,
    quantity: 1,
  };
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(cents / 100);
}

function displayIntegerInput(value?: number) {
  if (!value) return "";
  return String(value);
}

export default function CorporatePage() {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [packages, setPackages] = useState<CorporatePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | "">("");
  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    uen: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        const configuredPackages = await getCorporatePackages(current.id, true);
        setPackages(configuredPackages);
        setSelectedPackageId(configuredPackages[0]?.id ?? "");
      })
      .catch(() => setError("We could not load corporate ordering. Please try again later."));
  }, []);

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);
  const sizeOptions = useMemo(() => {
    const options = event?.shirtSizes ?? [];
    return {
      adult: Array.from(new Set(options.filter((item) => normalizeShirtType(item.type) === "adult").map((item) => item.size))),
      kid: Array.from(new Set(options.filter((item) => normalizeShirtType(item.type) === "kid").map((item) => item.size))),
    };
  }, [event?.shirtSizes]);
  const allocatedCount = allocations.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const remainingCount = Math.max(0, (selectedPackage?.totalShirts ?? 0) - allocatedCount);

  function getSizes(type: ShirtType) {
    return type === "kid" ? sizeOptions.kid : sizeOptions.adult;
  }

  function addAllocation(type: ShirtType = "adult") {
    const options = getSizes(type);
    const usedSizes = new Set(allocations.filter((row) => row.type === type).map((row) => row.size));
    const nextSize = options.find((size) => !usedSizes.has(size)) ?? options[0];
    if (!nextSize) return;
    setAllocations((current) => [...current, createAllocationRow(type, nextSize)]);
  }

  function updateAllocation(rowId: string, patch: Partial<AllocationRow>) {
    setAllocations((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const nextType = patch.type ?? row.type;
        const nextOptions = getSizes(nextType);
        return {
          ...row,
          ...patch,
          type: nextType,
          size: patch.size ?? (nextOptions.includes(row.size) ? row.size : nextOptions[0]),
          quantity: patch.quantity == null ? row.quantity : Math.max(0, patch.quantity),
        };
      }),
    );
  }

  function removeAllocation(rowId: string) {
    setAllocations((current) => current.filter((row) => row.id !== rowId));
  }

  async function handleSubmit() {
    if (!event || !selectedPackage) return;
    if (allocatedCount !== selectedPackage.totalShirts) {
      setError(`Please allocate exactly ${selectedPackage.totalShirts} shirts before submitting.`);
      return;
    }
    setError("");
    try {
      const id = await createCorporateOrder({
        eventId: event.id,
        ...form,
        corporatePackageId: selectedPackage.id,
        items: allocations
          .map((row) => ({ size: row.size, type: row.type, quantity: Number(row.quantity || 0) }))
          .filter((item) => item.quantity > 0),
      });
      setMessage(`Corporate order #${id} submitted. The Terry Fox Run Singapore team will follow up with payment details.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Corporate order failed.");
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Corporate Orders</Typography>
      </Box>
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Company details</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                ["companyName", "Company name"],
                ["uen", "UEN"],
                ["contactName", "Contact name"],
                ["contactEmail", "Contact email"],
                ["contactPhone", "Contact phone"],
                ["companyAddress", "Company address"],
              ].map(([key, label]) => (
                <Grid item xs={12} sm={key === "companyAddress" ? 12 : 6} key={key}>
                  <TextField fullWidth label={label} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Shirt allocation</Typography>
            {packages.length ? (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Corporate package</InputLabel>
                <Select
                  label="Corporate package"
                  value={selectedPackageId}
                  onChange={(event) => {
                    setSelectedPackageId(Number(event.target.value));
                    setAllocations([]);
                  }}
                >
                  {packages.map((pkg) => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.packageName} · {formatMoney(pkg.price)} · {pkg.totalShirts} shirts
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            {selectedPackage ? (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                <Typography fontWeight={800}>{selectedPackage.packageName}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Package total: {selectedPackage.totalShirts} shirts
                </Typography>
                <Typography color={remainingCount === 0 ? "success.main" : "text.secondary"} sx={{ mt: 0.5 }}>
                  Remaining to allocate: {selectedPackage.totalShirts - allocatedCount}
                </Typography>
              </Box>
            ) : null}

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {allocations.map((row, rowIndex) => {
                const typeOptions: ShirtType[] = sizeOptions.kid.length ? ["adult", "kid"] : ["adult"];
                const sizeChoices = getSizes(row.type);
                const usedSizes = new Set(allocations.filter((item) => item.type === row.type && item.id !== row.id).map((item) => item.size));
                const allowedSizes = sizeChoices.filter((size) => size === row.size || !usedSizes.has(size));
                return (
                  <Grid container spacing={1.25} alignItems="center" key={row.id}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          label="Type"
                          value={row.type}
                          onChange={(event) => updateAllocation(row.id, { type: event.target.value as ShirtType })}
                          inputProps={{ "aria-label": `Corporate shirt type ${rowIndex + 1}` }}
                        >
                          {typeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type === "adult" ? "Adult" : "Kids"}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>
                        <Select
                          label="Size"
                          value={row.size}
                          onChange={(event) => updateAllocation(row.id, { size: String(event.target.value) })}
                          inputProps={{ "aria-label": `Corporate shirt size ${rowIndex + 1}` }}
                        >
                          {allowedSizes.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={9} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={displayIntegerInput(row.quantity)}
                        inputProps={{ min: 0, "aria-label": `Corporate shirt quantity ${rowIndex + 1}` }}
                        onChange={(event) => updateAllocation(row.id, { quantity: Number(event.target.value || 0) })}
                      />
                    </Grid>
                    <Grid item xs={3} sm={1}>
                      <IconButton color="error" aria-label={`Remove shirt allocation ${rowIndex + 1}`} onClick={() => removeAllocation(row.id)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
              {!allocations.length ? (
                <Typography variant="body2" color="text.secondary">
                  No shirt sizes allocated yet.
                </Typography>
              ) : null}
            </Stack>
            <Button size="small" startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1.5 }} onClick={() => addAllocation("adult")}>
              Add shirt size
            </Button>

            <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={!event || !selectedPackage} onClick={handleSubmit}>
              Submit corporate order
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
