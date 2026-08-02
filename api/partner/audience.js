import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";
import { resolveAuthorizedWorkspaceScope } from "../_lib/workspaceScope.js";
const cohort=(n,admin)=>admin||n>=5?{count:n,display:String(n),suppressed:false}:{count:null,display:n?"<5":"0",suppressed:!!n};
export default async function handler(req,res){
 res.setHeader("Cache-Control","private, no-store");
 try { if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
 const db=requireTransactionDatabase(), scope=await resolveAuthorizedWorkspaceScope(req,db);
 const {data:bindings,error:bindingError}=await db.from("audience_scope_bindings").select("building_id").eq("organization_id",scope.organization.id).eq("status","active");
 if(bindingError) throw bindingError; const ids=[...new Set((bindings||[]).map(x=>x.building_id).filter(Boolean))];
 if(!ids.length) return res.status(200).json({data:{scope:{organizationId:scope.organization.id,organizationName:scope.organization.name},audience:{status:"setup_required",minimumCohortSize:5,totals:{eligible:cohort(0,scope.isSuperAdmin),contactable:cohort(0,scope.isSuperAdmin)},buildings:[],privacyNote:"Aggregate, consent-aware counts only. Person-level records are never returned."}}});
 const [{data:members,error:memberError},{data:buildings,error:buildingError}]=await Promise.all([db.from("audience_members").select("building_id,consent_partner_contact").eq("status","active").in("building_id",ids),db.from("resident_membership_buildings").select("id,name,district").in("id",ids)]);
 if(memberError||buildingError) throw memberError||buildingError; const meta=new Map((buildings||[]).map(x=>[x.id,x])); const groups=new Map();
 for(const m of members||[]){const g=groups.get(m.building_id)||{id:m.building_id,name:meta.get(m.building_id)?.name||"Authorized building",district:meta.get(m.building_id)?.district||"",eligible:0,contactable:0};g.eligible++;if(m.consent_partner_contact)g.contactable++;groups.set(m.building_id,g)}
 const total=(members||[]).length, contact=(members||[]).filter(x=>x.consent_partner_contact).length;
 return res.status(200).json({data:{scope:{organizationId:scope.organization.id,organizationName:scope.organization.name},audience:{status:"connected",minimumCohortSize:5,totals:{eligible:cohort(total,scope.isSuperAdmin),contactable:cohort(contact,scope.isSuperAdmin)},buildings:[...groups.values()].map(g=>({...g,eligible:cohort(g.eligible,scope.isSuperAdmin),contactable:cohort(g.contactable,scope.isSuperAdmin)}),privacyNote:"Aggregate, consent-aware counts only. Person-level records are never returned."}}});
 } catch(error){return sendTransactionError(res,error)} }