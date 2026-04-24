import { z } from 'zod'
import {NamespaceSchema} from "@/entities/namespace/api/constracts";

const MachineUserSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const MachinesSchema = z.object({
  id: z.string(),
  machineKey: z.string().optional(),
  nodeKey: z.string().optional(),
  discoKey: z.string().optional(),
  givenName: z.string().optional(),
  availableRoutes: z.array(z.string()).default([]),
  approvedRoutes: z.array(z.string()).default([]),
  user: MachineUserSchema.optional(),
  tags: z.array(z.string()).default([]),
  online: z.boolean().optional(),
  ipAddresses: z.array(z.string()).default([]),
  lastSeen: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  name: z.string().optional(),
  expiry: z.string().datetime().optional(),
  preAuthKey: z.string().optional(),
  registerMethod: z.string().optional(),
  subnetRoutes: z.array(z.string()).default([]),
})

export const MachineSchema = MachinesSchema

export const MachinesListSchema = z.object({
  machines: z.array(MachinesSchema),
})

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
})

export type Machine = z.infer<typeof MachinesSchema>
export type MachineList = z.infer<typeof MachinesListSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
