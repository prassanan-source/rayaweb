import assert from "node:assert/strict";
import test from "node:test";
import { classifyToastHttp } from "@/lib/toast/errors";
import { missingCredentialMessage, privilegeMessage, readTokenScopes } from "@/lib/toast/diagnose";

test("HTTP 401 means the client ID or secret is wrong", () => {
  const error = classifyToastHttp(401, "login");
  assert.equal(error.code, "TOAST_AUTH_FAILED");
  assert.match(error.message, /client ID or client secret is wrong/i);
});

test("HTTP 403 means the client lacks write privilege on this restaurant", () => {
  const error = classifyToastHttp(403, "order create");
  assert.equal(error.code, "TOAST_FORBIDDEN");
  assert.match(error.message, /does not have write\/read privilege/i);
  assert.match(error.message, /orders\.orders:write/);
});

test("missing credentials message lists env vars and says Toast was never called", () => {
  const message = missingCredentialMessage();
  assert.match(message, /not a wrong-password error/);
  assert.match(message, /TOAST_CLIENT_ID/);
  assert.match(message, /TOAST_CLIENT_SECRET/);
});

test("privilegeMessage flags missing orders.orders:write", () => {
  const message = privilegeMessage(["menus.channel:read", "config:read"]);
  assert.match(message, /does not have write privilege/);
  assert.match(message, /orders\.orders:write/);
});

test("readTokenScopes reads a JWT payload", () => {
  const payload = Buffer.from(
    JSON.stringify({ scope: "orders.orders:write menus.channel:read" }),
    "utf8"
  ).toString("base64url");
  const token = `header.${payload}.sig`;
  assert.deepEqual(readTokenScopes(token), ["orders.orders:write", "menus.channel:read"]);
});
